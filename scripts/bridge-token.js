// scripts/bridge-token.js

require("dotenv").config();
const { ethers } = require("ethers");
const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function main() {
  const heliosRpc = process.env.HELIOS_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!heliosRpc || !privateKey) {
    throw new Error("❌ Missing HELIOS_RPC_URL or PRIVATE_KEY in .env");
  }

  const heliosToken = await ask("🔗 MyToken address on Helios: ");
  const heliosBridge = await ask("🌉 HeliosBridge address: ");
  const amountInput = await ask("💰 Amount to bridge (in tokens, e.g., 10.5): ");
  const amount = ethers.utils.parseUnits(amountInput, 18);

  const provider = new ethers.providers.JsonRpcProvider(heliosRpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bridgeAbi = [
    "function bridgeToSepolia(uint256 amount) external",
  ];
  const tokenAbi = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
  ];

  const token = new ethers.Contract(heliosToken, tokenAbi, wallet);
  const bridge = new ethers.Contract(heliosBridge, bridgeAbi, wallet);

  const allowance = await token.allowance(wallet.address, heliosBridge);
  if (allowance.lt(amount)) {
    console.log("🔓 Approving bridge to spend tokens...");
    const approveTx = await token.approve(heliosBridge, amount);
    await approveTx.wait();
    console.log(`✅ Approved: ${approveTx.hash}`);
  }

  console.log("🚀 Bridging tokens to Sepolia...");
  const tx = await bridge.bridgeToSepolia(amount, { gasLimit: 300_000 });
  console.log(`📨 Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log("✅ Bridge initiated!");
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
