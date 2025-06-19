require("dotenv").config();
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

async function deployWithNetwork(network, fn) {
  const hre = require("hardhat");

  // Override network in the global config
  hre.network.name = network;

  // Inject provider + signer for that network
  await hre.run("compile"); // Just in case
  await fn(hre); // Pass in the customized HRE
}

async function main() {
  const deployHeliosBridge = require("../deployers/helios");
  const deploySepoliaBridge = require("../deployers/sepolia");

  const networkChoice = await ask("🌐 Deploy to which network? (helios/sepolia/both): ");

  if (networkChoice === "helios" || networkChoice === "both") {
    console.log("\n📡 Deploying to Helios...");
    const tokenAddressHelios = await ask("🔗 MyToken address on Helios: ");
    process.env.TARGET_NETWORK = "heliosTestnet"; // Optional
    await deployWithNetwork("heliosTestnet", async (hre) => {
      await deployHeliosBridge(tokenAddressHelios, hre);
    });
  }

  if (networkChoice === "sepolia" || networkChoice === "both") {
    console.log("\n📡 Deploying to Sepolia...");
    const tokenAddressSepolia = await ask("🔗 MyToken address on Sepolia: ");
    const relayer = await ask("👤 Relayer address for Sepolia: ");
    await deployWithNetwork("sepolia", async (hre) => {
      await deploySepoliaBridge(tokenAddressSepolia, relayer, hre);
    });
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
