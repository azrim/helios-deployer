require("dotenv").config();
const { ethers } = require("hardhat");
const readline = require("readline");
const { logDeployment } = require("./utils/logger");

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

async function deployToNetwork(name, symbol, supplyRaw, rpcUrl, label) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const supply = ethers.utils.parseUnits(supplyRaw, 18);
  const Token = await ethers.getContractFactory("MyToken", wallet);
  const token = await Token.deploy(name, symbol, supply, wallet.address);
  await token.deployed();

  console.log(`✅ ${label} Deployment`);
  console.log(`📦 Address: ${token.address}`);
  console.log(`🔗 Tx Hash: ${token.deployTransaction.hash}`);
  await logDeployment(`${symbol}_${label}`, token.address, token.deployTransaction.hash, token.deployTransaction);
}

async function main() {
  const name = await ask("📛 Token name (e.g. Azrim Token): ");
  const symbol = await ask("🔤 Token symbol (e.g. AZR): ");
  const supplyRaw = await ask("💰 Initial supply (whole number): ");
  const networkChoice = (await ask("🌍 Where to deploy? (helios/sepolia/both): ")).toLowerCase();

  if (networkChoice === "helios" || networkChoice === "both") {
    console.log("\n🚀 Deploying to Helios...");
    await deployToNetwork(name, symbol, supplyRaw, process.env.HELIOS_RPC_URL, "Helios");
  }

  if (networkChoice === "sepolia" || networkChoice === "both") {
    console.log("\n🚀 Deploying to Sepolia...");
    await deployToNetwork(name, symbol, supplyRaw, process.env.SEPOLIA_RPC_URL, "Sepolia");
  }

  if (!["helios", "sepolia", "both"].includes(networkChoice)) {
    console.error("❌ Invalid network option. Please choose: helios, sepolia, or both.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
