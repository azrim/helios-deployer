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
  const selectorBase = await ask("🔧 Function name (e.g. autoMint): ");
  const mintAmountRaw = await ask("🔢 How many NFTs per cron execution?: ");
  const frequency = await ask("⏱️ Frequency in blocks (e.g. 180): ");
  const deposit = await ask("💰 Deposit (e.g. 1 for 1 HLS): ");
  const mintAmount = parseInt(mintAmountRaw);

  if (isNaN(mintAmount) || mintAmount <= 0) {
    console.error("❌ Invalid mint amount.");
    process.exit(1);
  }

  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const contractInterface = new ethers.utils.Interface(contractArtifact.abi);

  // Choose function signature based on whether amount is 1 or more
  const fullSelectorName = mintAmount === 1
    ? `${selectorBase}()`
    : `${selectorBase}(uint256)`;
  const args = mintAmount === 1 ? [] : [mintAmount];

  const selector = contractInterface.getSighash(fullSelectorName);

  const tx = await chronos.createCron(
    targetAddress,
    JSON.stringify(contractArtifact.abi),
    selectorBase, // name without types
    args,
    parseInt(frequency),
    0,
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

  await logDeployment(`CronTask_${selectorBase}_${frequency}`, targetAddress, tx.hash, tx, {
    mintAmount,
    interval: frequency,
    selector
  });
}

main().catch(console.error);
