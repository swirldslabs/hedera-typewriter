// netlify/functions/scores.mjs
import { Client, AccountId, PrivateKey, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

/** Environment */
const OPERATOR_ID = process.env.OPERATOR_ID;      // e.g. 0.0.xxxxx
const OPERATOR_KEY = process.env.OPERATOR_KEY;    // private key
const TOPIC_ID     = process.env.TOPIC_ID;        // e.g. 0.0.yyyyy
const MIRROR       = "https://testnet.mirrornode.hedera.com"; // change if mainnet

// Hedera client (cold-started per function invocation group)
const client = (() => {
  const c = Client.forTestnet();
  c.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromStringECDSA(OPERATOR_KEY));
  return c;
})();

/** Parse base64 mirror-node message -> { name, wpm, mistakes, cpm } */
function parseMessage(m) {
  try {
    const txt = Buffer.from(m, "base64").toString("utf8");
    // Format used by your server: `${sanitizedName}:${wpm}:${mistakes}:${cpm}`
    const [name, wpm, mistakes, cpm] = txt.split(":");
    return { name, wpm: Number(wpm), mistakes: Number(mistakes), cpm: Number(cpm) };
  } catch {
    return null;
  }
}

/** Sort like your app: WPM desc, mistakes asc, CPM desc */
function sortScores(a, b) {
  if (b.wpm !== a.wpm) return b.wpm - a.wpm;
  if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes;
  return b.cpm - a.cpm;
}

/** Get all messages from mirror node (paged) */
async function fetchAllScores() {
  let url = `${MIRROR}/api/v1/topics/${TOPIC_ID}/messages?limit=100&order=desc`;
  const out = [];

  while (url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) break;
    const data = await res.json();
    for (const msg of data.messages || []) {
      const parsed = parseMessage(msg.message);
      if (parsed) out.push(parsed);
    }
    // page backward until no next link
    url = data.links?.next ? `${MIRROR}${data.links.next}` : null;
    // safety: don’t pull unbounded history
    if (out.length > 2000) break;
  }

  return out;
}

/** Very light validation + name sanitization (follow your server’s intent) */
function sanitizeAndValidate(body) {
  if (!body || typeof body !== "object") throw new Error("Invalid payload");
  let { name, wpm, mistakes, cpm } = body;

  // Coerce
  wpm = Number(wpm); mistakes = Number(mistakes); cpm = Number(cpm);
  if (!Number.isFinite(wpm) || !Number.isFinite(mistakes) || !Number.isFinite(cpm)) {
    throw new Error("wpm/mistakes/cpm must be numbers");
  }
  if (wpm < 0 || wpm > 2000) throw new Error("wpm out of range");
  if (mistakes < 0 || mistakes > 10000) throw new Error("mistakes out of range");
  if (cpm < 0 || cpm > 20000) throw new Error("cpm out of range");

  name = (name ?? "").toString().trim().slice(0, 24).replace(/[^a-zA-Z0-9 _.-]/g, "");
  if (!name) throw new Error("name required");

  return { name, wpm, mistakes, cpm };
}

/** Calculate rank if we appended the new score to current list */
function calculateRank(scores, newScore) {
  const list = scores.slice();
  list.push(newScore);
  list.sort(sortScores);
  const idx = list.findIndex(
    s => s.name === newScore.name && s.wpm === newScore.wpm && s.mistakes === newScore.mistakes && s.cpm === newScore.cpm
  );
  return idx >= 0 ? idx + 1 : list.length;
}

export default async (req, context) => {
  const method = req.method.toUpperCase();

  // CORS (only needed if you serve the frontend from another origin)
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  try {
    if (method === "GET") {
      const scores = await fetchAllScores();
      // Return the whole list or top 100 — your frontend calculates provisional rank anyway
      const sorted = scores.sort(sortScores).slice(0, 1000);
      return Response.json(sorted, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    if (method === "POST") {
      const body = await req.json();
      const { name, wpm, mistakes, cpm } = sanitizeAndValidate(body);

      // Submit to HCS
      const tx = new TopicMessageSubmitTransaction({
        topicId: TOPIC_ID,
        message: `${name}:${wpm}:${mistakes}:${cpm}`
      });
      const signed = await tx.freezeWith(client).sign(PrivateKey.fromStringECDSA(OPERATOR_KEY));
      const resp = await signed.execute(client);
      await resp.getReceipt(client); // wait for consensus

      // Best-effort rank (mirror node is eventually consistent; this uses current snapshot)
      const current = await fetchAllScores();
      const rank = calculateRank(current, { name, wpm, mistakes, cpm });

      return Response.json({ ok: true, rank }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message || "Server error" }, { status: 400 });
  }
};
