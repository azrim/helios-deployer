const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { logDeployment } = require("./utils/logger");

const readline = require("readline");
function ask(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abiPath = "abi/chronos.json";
  const abi = JSON.parse(fs.readFileSync(abiPath, "utf-8")).abi;
  const chronos = new ethers.Contract("0x0000000000000000000000000000000000000830", abi, wallet);

  const targetAddress = await ask("🎯 Target contract address: ");
  const contractName = await ask("📄 Contract name (e.g. ChronosController): ");
  const selector = await ask("🔧 Function name (e.g. autoMint): ");
  const frequency = await ask("⏱️ Frequency in blocks (e.g. 180): ");
  const deposit = await ask("💰 Deposit (e.g. 1 for 1 HLS): ");

  // ✅ Load full compiled ABI of the target contract
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );

  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const fullAbiJson = JSON.stringify(contractArtifact.abi);

  const tx = await chronos.createCron(
    targetAddress,
    fullAbiJson,
    selector,
    [],
    parseInt(frequency),
    0, // no expiration
    400_000,
    ethers.utils.parseUnits("2", "gwei"),
    ethers.utils.parseEther(deposit),
    { gasLimit: 600_000 }
  );

  const receipt = await tx.wait();
  console.log("✅ Cron scheduled:", tx.hash);
  console.log("📦 Gas Used:", receipt.gasUsed.toString());

  if (receipt.logs.length > 0) {
    console.log("🧾 Logs found:", receipt.logs.length);
  } else {
    console.warn("⚠️ No logs emitted — Cron may not have been persisted.");
  }
  await logDeployment(`CronTask_${selector}_${frequency}`, targetAddress, tx.hash, tx);
}

main().catch(console.error);
