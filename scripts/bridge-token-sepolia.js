// scripts/bridge-token-sepolia.js
require("dotenv").config();
const { ethers } = require("ethers");
const readline = require("readline");

const sepoliaRpc = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const tokenAddress = process.env.SEPOLIA_TOKEN;
const bridgeAddress = process.env.SEPOLIA_BRIDGE;

const fs = require("fs");
const path = require("path");

const bridgeJsonPath = path.join(__dirname, "../abi/SepoliaBridge.json");
const bridgeJson = JSON.parse(fs.readFileSync(bridgeJsonPath));
const bridgeAbi = bridgeJson.abi;

const tokenJsonPath = path.join(__dirname, "../abi/MyToken.json");
const tokenJson = JSON.parse(fs.readFileSync(tokenJsonPath));
const tokenAbi = tokenJson.abi;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(sepoliaRpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);
  const bridge = new ethers.Contract(bridgeAddress, bridgeAbi, wallet);

  console.log(`🔗 MyToken address on Sepolia: ${tokenAddress}`);
  console.log(`🌉 SepoliaBridge address: ${bridgeAddress}`);

  const amountStr = await ask("💰 Amount to bridge (e.g. 10.5): ");
  const amount = ethers.utils.parseUnits(amountStr, 18);
  rl.close();

  console.log("🔓 Approving bridge to spend tokens...");
  const approveTx = await token.approve(bridgeAddress, amount);
  await approveTx.wait();
  console.log(`✅ Approved: ${approveTx.hash}`);

  console.log("🚀 Bridging tokens to Helios...");
  const tx = await bridge.bridgeToHelios(amount, { gasLimit: 300_000 });
  console.log(`📨 Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log("✅ Bridge initiated!");
}

main().catch(console.error);
