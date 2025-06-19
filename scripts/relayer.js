require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Environment Variables
const {
  HELIOS_RPC_URL,
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
  HELIOS_BRIDGE,
  SEPOLIA_BRIDGE,
  SEPOLIA_TOKEN, // Optional
} = process.env;

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

function validateEnv() {
  const required = {
    HELIOS_RPC_URL,
    SEPOLIA_RPC_URL,
    PRIVATE_KEY,
    HELIOS_BRIDGE,
    SEPOLIA_BRIDGE,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
}

function loadAbi(name) {
  const abiPath = path.join(__dirname, "..", "abi", `${name}.json`);
  try {
    const abi = JSON.parse(fs.readFileSync(abiPath));
    // If full artifact was saved, pull `.abi`, else assume it's ABI-only
    return abi.abi || abi;
  } catch (err) {
    console.error(`❌ Failed to load ABI for ${name}:`, err.message);
    process.exit(1);
  }
}

async function main() {
  validateEnv();

  // Load ABIs
  const heliosAbi = loadAbi("HeliosBridge");
  const sepoliaAbi = loadAbi("SepoliaBridge");

  // Setup providers and wallets
  const heliosProvider = new ethers.providers.JsonRpcProvider(HELIOS_RPC_URL);
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const relayerWallet = new ethers.Wallet(PRIVATE_KEY, sepoliaProvider);

  const heliosBridge = new ethers.Contract(HELIOS_BRIDGE, heliosAbi, heliosProvider);
  const sepoliaBridge = new ethers.Contract(SEPOLIA_BRIDGE, sepoliaAbi, relayerWallet);

  log("🔁 Relayer is watching for Helios → Sepolia bridge events...");

  heliosBridge.on("BridgedToSepolia", async (user, amount, event) => {
    const formatted = ethers.utils.formatUnits(amount, 18);
    log(`📦 Event detected:
    👤 User: ${user}
    💰 Amount: ${formatted}
    🔎 TX: ${event.transactionHash}`);

    try {
      // Optional: reject if not allowed token
      if (SEPOLIA_TOKEN && (await sepoliaBridge.token()) !== SEPOLIA_TOKEN) {
        throw new Error("Token address mismatch — refusing to mint");
      }

      const tx = await sepoliaBridge.mintTo(user, amount, { gasLimit: 300_000 });
      log(`✅ Minted on Sepolia: ${tx.hash}`);
    } catch (err) {
      log("❌ Mint failed:", err.reason || err.message || err);
    }
  });

  process.on("SIGINT", () => {
    log("🛑 Relayer shutting down...");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("❌ Relayer initialization error:", err.message || err);
});
