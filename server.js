// server.js
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { rateLimit } from 'express-rate-limit'
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, "scores.json");
const topicId = process.env.TOPIC_ID; // Replace with your actual topic ID

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	limit: 150, // Limit each IP to 100 requests per `window`
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})

app.use(limiter) // Apply the rate limiting middleware to all requests.

// Hedera setup
import {
  AccountId,
  PrivateKey,
  Client,
  TopicMessageSubmitTransaction
} from "@hashgraph/sdk";

const MY_ACCOUNT_ID = AccountId.fromString(process.env.OPERATOR_ID);
const MY_PRIVATE_KEY = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);

// Pre-configured client for test network (testnet)
let client = Client.forTestnet();

//Set the operator with the account ID and private key
client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

// --- RESTART SERVER SETUP AND SYNC WITH HEDERA TOPIC ---
// Retrieve existing scores from Hedera topic
async function syncScoresFromTopic() {
  try {
    const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=1`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
    let scores = await res.json();
    let messages = scores.messages.map((msg) => {
      return Buffer.from(msg.message, 'base64').toString('utf8');
    });
    while (scores.links.next) {
      const nextRes = await fetch(`https://testnet.mirrornode.hedera.com${scores.links.next}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      let nextScores = await nextRes.json();
      messages = messages.concat(nextScores.messages.map((msg) => Buffer.from(msg.message, 'base64').toString('utf8')));
      scores = nextScores;
    }

    // Parse messages into score objects
    const blockchainScores = messages.map((msg) => {
      const [name, wpm, mistakes, cpm] = msg.split(":");
      return {
        name,
        wpm: parseInt(wpm),
        mistakes: parseInt(mistakes),
        cpm: parseInt(cpm),
      };
    });

    // Sort scores (first wpm, then mistakes, then cpm)
    blockchainScores.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm; // Sort by WPM descending
      if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes; // Sort by mistakes ascending
      return b.cpm - a.cpm; // Sort by CPM descending
    });

    // Save scores to local file
    saveScores(blockchainScores);
    console.log("Scores synced from Hedera topic.");
  } catch (error) {
    console.error("Error syncing scores from Hedera topic:", error);
  }
}
syncScoresFromTopic();

// --- CORS SETUP ---
// Allow only requests coming from http://localhost:3000
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// --- ROOT REDIRECT ---
// Redirect only the bare domain to the game index. Other routes (e.g. /api/scores) remain unchanged.
app.get('/', (req, res) => {
  res.redirect('/game/index.html');
});

// If you need to handle preflight manually (not usually needed with cors()):
app.options("/api/scores", (req, res) => {
  res.sendStatus(204);
});

// --- parse JSON bodies ---
app.use(express.json());

// --- serve static files from public/ ---
app.use("/game", express.static(path.join(__dirname, "public")));

// --- simple JSON file storage helpers ---
function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, "utf-8"));
  } catch {
    return [];
  }
}
function saveScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// --- GET top-10 scores ---
app.get("/api/scores", (req, res) => {
  const top10 = loadScores()
    .sort((a, b) => b.wpm - a.wpm)
    // .slice(0, 10); -> Uncomment this line to limit to top 10
  res.json(top10);
});

const scoreSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z0-9 _-]+$/)
    .required(),
  wpm: Joi.number().integer().min(0).max(1000).required(),
  mistakes: Joi.number().integer().min(0).max(1000).required(),
  cpm: Joi.number().integer().min(0).max(2000).required(),
});

// --- POST a new score ---
app.post("/api/scores", async (req, res) => {
  // Validate request body
  const { error, value } = scoreSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, wpm, mistakes, cpm } = value;
  const sanitizedName = name.replace(/[<>]/g, '');

  // Store score in topic ID
  const txTopicMessageSubmit = await new TopicMessageSubmitTransaction({
    topicId,
    message: `${sanitizedName}:${wpm}:${mistakes}:${cpm}`,
  }).freezeWith(client);

  const signedTx = await txTopicMessageSubmit.sign(MY_PRIVATE_KEY);
  const txTopicMessageSubmitResponse = await signedTx.execute(client);

  await txTopicMessageSubmitResponse.getReceipt(client); // Wait for the transaction to be confirmed

  // Store locally for easy restarting of the server
  const scores = loadScores();
  scores.push({ name: sanitizedName, wpm, mistakes, cpm });

  // Sort scores (first wpm, then mistakes, then cpm) and save them
  scores.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm; // Sort by WPM descending
    if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes; // Sort by mistakes ascending
    return b.cpm - a.cpm; // Sort by CPM descending
  });
  saveScores(scores);

  // return rank of the new score
  const rank =
    scores.findIndex(
      (score) => score.name === sanitizedName && score.wpm === wpm && score.cpm === cpm
    ) + 1;
  console.log(`Rank of ${sanitizedName} with WPM ${wpm}: ${rank}`);
  res.status(201).json({ success: true, rank });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
