require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const sepoliaRpc = process.env.SEPOLIA_RPC_URL;
const heliosRpc = process.env.HELIOS_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

const sepoliaBridgeAddress = process.env.SEPOLIA_BRIDGE;
const heliosBridgeAddress = process.env.HELIOS_BRIDGE;

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function main() {
  const sepoliaAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abi/SepoliaBridge.json"))).abi;
  const heliosAbi = JSON.parse(fs.readFileSync(path.join(__dirname, "../abi/HeliosBridge.json"))).abi;

  const sepoliaProvider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
  const heliosProvider = new ethers.providers.JsonRpcProvider(heliosRpc);
  const wallet = new ethers.Wallet(privateKey, heliosProvider);

  const sepoliaBridge = new ethers.Contract(sepoliaBridgeAddress, sepoliaAbi, sepoliaProvider);
  const heliosBridge = new ethers.Contract(heliosBridgeAddress, heliosAbi, wallet);

  log("🔁 Relayer is watching for Sepolia → Helios bridge events...");

  sepoliaBridge.on("MintedFromHelios", async (user, amount, event) => {
    const formatted = ethers.utils.formatUnits(amount, 18);
    log(`📦 BridgedToHelios event detected:\n   👤 User: ${user}\n   💰 Amount: ${formatted}`);

    try {
      const tx = await heliosBridge.mintTo(user, amount, { gasLimit: 300_000 });
      log(`✅ Minted on Helios: ${tx.hash}`);
    } catch (err) {
      log("❌ Mint failed:", err.message || err);
    }
  });

  process.on("SIGINT", () => {
    log("🛑 Relayer shutting down...");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("❌ Relayer initialization error:", err);
});
