const paragraphs = [
  "The Hedera Consensus Service acts as a trust layer for any distributed application that requires fair and tamper-proof message ordering. Developers can use this service to submit messages to the Hedera network, which are then cryptographically timestamped and ordered using the hashgraph consensus algorithm. This ensures that all participants in the network can rely on a consistent and immutable record of events. Whether you are building a supply chain tracker, a decentralized gaming leaderboard, or a financial settlement system, the Hedera Consensus Service guarantees transparency, security, and high throughput without sacrificing performance or scalability.",
  "Hedera Token Service (HTS) revolutionizes the way developers create and manage fungible and non-fungible tokens (NFTs). Unlike traditional platforms, HTS eliminates the need for custom smart contracts, which are often costly and prone to errors. Instead, tokens on Hedera are native to the network, inheriting its unmatched speed, low-latency consensus, and industry-leading security. Developers can configure granular token properties, such as KYC, freezing, and custom fees, directly through API calls. This makes HTS an ideal solution for tokenizing assets, building decentralized finance (DeFi) platforms, or even creating loyalty reward systems, all with low energy consumption and predictable costs.",
  "Hedera's asynchronous Byzantine Fault Tolerance (aBFT) is a cornerstone of its security and reliability. This cutting-edge algorithm ensures that the network can achieve consensus even in the presence of malicious nodes or network failures. Unlike traditional blockchain protocols, which may suffer from forks or delayed finality, Hedera provides instant and deterministic finality, making it ideal for mission-critical applications. Developers building financial applications, healthcare systems, or IoT integrations can trust Hedera's aBFT to provide fault tolerance without compromising throughput. This advanced consensus mechanism also supports fairness, ensuring that no single node can manipulate the order of transactions.",
  "Smart contracts on Hedera are powered by the Ethereum Virtual Machine (EVM), allowing developers to leverage the vast ecosystem of Solidity code and tools. By deploying smart contracts on Hedera, developers can benefit from its unique hashgraph consensus, which provides significantly higher throughput and lower fees compared to traditional Ethereum networks. This makes Hedera ideal for applications like decentralized finance (DeFi), gaming, and complex multi-party agreements. Additionally, Hedera's predictable gas fees ensure developers can scale their applications without worrying about sudden spikes in transaction costs, making it a superior platform for enterprise-grade solutions.",
  "The Mirror Node API is a powerful tool for developers who need access to historical and real-time data from the Hedera network. Unlike consensus nodes, which focus on transaction validation and ordering, mirror nodes store a complete history of the network's state and transactions. This data can be accessed through REST APIs or gRPC, allowing developers to query information such as account balances, token transfers, and contract logs. Whether you're building analytics dashboards, monitoring tools, or blockchain explorers, the Mirror Node API ensures you have a reliable and efficient way to access all the data you need for your application.",
  "Minting NFTs on Hedera is both efficient and environmentally friendly, thanks to the Hedera Token Service (HTS) and its underlying hashgraph consensus algorithm. Unlike traditional blockchains, which require complex and costly smart contracts for NFTs, HTS provides a straightforward and streamlined process for creating tokens with unique identifiers. This makes Hedera an excellent choice for artists, game developers, and businesses looking to tokenize digital assets. Additionally, Hedera's low, predictable fees and carbon-negative network ensure that your NFT creation process is not only cost-effective but also sustainable, aligning with modern environmental standards.",
  "Hedera's public key infrastructure (PKI) and account model provide a simplified yet highly secure framework for cryptographic operations. Each account on Hedera is associated with an Ed25519 public-private key pair, which ensures robust security against modern attack vectors. Developers can use the Hedera SDK to perform operations like signing transactions, managing multi-signature accounts, and integrating key rotation for enhanced security. This cryptographic foundation is critical for applications that handle sensitive data or financial transactions, as it ensures that all operations are authenticated and verifiable, without compromising on performance.",
  "Hedera's file storage capabilities offer a unique approach to managing small data files on a distributed network. Unlike centralized cloud storage solutions, Hedera stores files directly on the hashgraph, ensuring immutability and decentralized access. Developers can use this feature to store configuration files, public keys, or metadata associated with tokens or smart contracts. Files stored on Hedera are secured through cryptographic hashes, making them tamper-proof and easily verifiable. This is particularly useful for use cases such as digital identity management, document verification, and decentralized applications requiring lightweight data storage.",
  "The Hedera SDK supports multiple programming languages, including Java, JavaScript, Python, and Go, enabling developers to integrate Hedera's services with their preferred tech stack. This flexibility allows seamless adoption of Hedera's APIs for use cases like payment systems, token management, and decentralized applications. The SDK also includes utilities for managing accounts, querying transaction history, and signing messages, simplifying the development process. By providing comprehensive documentation and active community support, Hedera ensures that developers can quickly prototype, build, and deploy scalable applications on its network.",
  "Leveraging the Hedera Consensus Service (HCS), developers can build decentralized event-tracking systems with guaranteed immutability and fairness. By submitting events to the HCS, applications receive cryptographic timestamps and globally ordered events, ensuring a reliable audit trail for regulatory compliance. This capability is ideal for industries like supply chain management, where transparency and traceability are crucial, or for financial services that require tamper-proof transaction logs. The low latency and high throughput of HCS make it an unparalleled choice for applications requiring real-time event processing at scale, all while maintaining low operational costs.",
];

const typingText = document.querySelector(".typing-text p");
const inpField = document.querySelector(".wrapper .input-field");
const tryAgainBtn = document.getElementById("tryAgain");
const timeTag = document.querySelector(".time span b");
const mistakeTag = document.querySelector(".mistake span");
const wpmTag = document.querySelector(".wpm span");
const cpmTag = document.querySelector(".cpm span");

let timer;
let maxTime = 40; // If you change this value, make sure to update the HTML value as well
let timeLeft = maxTime;
let charIndex = (mistakes = isTyping = 0);

// Modal elements
const nameForm = document.getElementById('nameForm');
const playerNameInput = document.getElementById('playerNameInput');
const submitNameBtn = document.getElementById('submitName');

// Hide name form and button initially
nameForm.hidden = true;
submitNameBtn.style.display = 'none';

// Menu buttons
document.getElementById('playNow').addEventListener('click', resetGame);

function loadParagraph() {
  const ranIndex = Math.floor(Math.random() * paragraphs.length);
  typingText.innerHTML = "";
  paragraphs[ranIndex].split("").forEach((char) => {
    let span = `<span>${char}</span>`;
    typingText.innerHTML += span;
  });
  typingText.querySelectorAll("span")[0].classList.add("active");
  document.addEventListener("keydown", () => {
    const isModalOpen =
      document.getElementById("resultModal").style.display === "flex";
    if (!isModalOpen) {
      inpField.focus();
    }
  });
  typingText.addEventListener("click", () => inpField.focus());
}

function initTyping() {
  let characters = typingText.querySelectorAll("span");
  let typedChar = inpField.value.split("")[charIndex];
  if (charIndex < characters.length && timeLeft > 0) {
    if (!isTyping) {
      timer = setInterval(initTimer, 1000);
      isTyping = true;
    }
    if (typedChar == null) {
      if (charIndex > 0) {
        charIndex--;
        if (characters[charIndex].classList.contains("incorrect")) {
          mistakes--;
        }
        characters[charIndex].classList.remove("correct", "incorrect");
      }
    } else {
      if (characters[charIndex].innerText == typedChar) {
        characters[charIndex].classList.add("correct");
      } else {
        mistakes++;
        characters[charIndex].classList.add("incorrect");
      }
      charIndex++;
    }

    // Remove active class from all spans and add to current
    characters.forEach((span) => span.classList.remove("active"));
    if (characters[charIndex]) {
      characters[charIndex].classList.add("active");

      // Scroll to the active character
      characters[charIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    let wpm = Math.round(
      ((charIndex - mistakes) / 5 / (maxTime - timeLeft)) * 60
    );
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

    wpmTag.innerText = wpm;
    mistakeTag.innerText = mistakes;
    cpmTag.innerText = charIndex - mistakes;
  } else {
    clearInterval(timer);
    inpField.value = "";
    showModal();
  }
}

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeTag.innerText = timeLeft;
  } else {
    clearInterval(timer);
    showModal();
  }
}

function resetGame() {
  loadParagraph();
  clearInterval(timer);
  timeLeft = maxTime;
  charIndex = mistakes = isTyping = 0;
  inpField.value = "";
  timeTag.innerText = timeLeft;
  wpmTag.innerText = 0;
  mistakeTag.innerText = 0;
  cpmTag.innerText = 0;
}

// Modal Functions
// Show results modal and name form
async function showModal() {
  const modal = document.getElementById('resultModal');
  document.getElementById('modalMistakes').innerText = mistakes;
  document.getElementById('modalWPM').innerText = wpmTag.innerText;
  document.getElementById('modalCPM').innerText = cpmTag.innerText;
  document.getElementById('modalRank').innerText = 'TBD'; // Placeholder until score is submitted

  // Reveal the form
  nameForm.hidden = false;
  submitNameBtn.style.display = '';
  playerNameInput.disabled = false;
  playerNameInput.value = '';
  submitNameBtn.disabled = false;

  modal.style.display = 'flex';
  playerNameInput.focus();
}

typeof showModal;

// Handle score submission via the standalone button
submitNameBtn.addEventListener('click', async () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name.');
    playerNameInput.focus();
    return;
  }
  if (name.includes(':')) {
    alert('Name cannot contain colons (:). Please try again.');
    playerNameInput.focus();
    return;
  }

  submitNameBtn.disabled = true;
  document.getElementById('modalRank').innerText = 'Submitting...';

  const rank = await submitScore(
    name,
    wpmTag.innerText,
    mistakes,
    cpmTag.innerText
  );

  document.getElementById('modalRank').innerText = rank;
  playerNameInput.disabled = true;
  submitNameBtn.style.display = 'none';
});

// Close modal, reset form, reset game, refocus
function closeModal() {
  const modal = document.getElementById('resultModal');
  modal.style.display = 'none';

  nameForm.hidden = true;
  playerNameInput.disabled = false;
  playerNameInput.value = '';
  submitNameBtn.disabled = false;
  submitNameBtn.style.display = 'none';

  resetGame();
  inpField.focus();
}


async function submitScore(name, wpm, mistakes, cpm) {
  try {
    const response = await fetch("http://localhost:3000/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        wpm: parseInt(wpm),
        mistakes: parseInt(mistakes),
        cpm: parseInt(cpm),
      }),
    });

    // Optionally redirect to leaderboard
    //window.location.href = '/game/leaderboard.html';

    const { rank } = await response.json();
    return rank;
  } catch (err) {
    console.error("Failed to submit score", err);
  }
}

document.getElementById("closeModal").addEventListener("click", closeModal);
tryAgainBtn.addEventListener("click", () => {
  // If the modal is open, close it first
  if (document.getElementById("resultModal").style.display === "flex") {
    closeModal();
  } else {
    resetGame();
    inpField.focus();
  }
});

loadParagraph();
inpField.addEventListener("input", initTyping);
