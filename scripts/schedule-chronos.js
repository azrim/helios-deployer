const { ethers } = require("hardhat");
const fs = require("fs");
const readline = require("readline");

require("dotenv").config();

function ask(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = JSON.parse(fs.readFileSync("abi/chronos.json", "utf-8")).abi;
  const chronos = new ethers.Contract("0x0000000000000000000000000000000000000830", abi, wallet);

  const target = await ask("🎯 Target contract address: ");
  const method = await ask("🔧 Function name (e.g. autoMint): ");
  const interval = parseInt(await ask("⏱️ Frequency in blocks (e.g. 300): "));
  const deposit = await ask("💰 Deposit (e.g. 1 for 1 HLS): ");

  const fnAbi = [
    {
      name: method,
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: []
    }
  ];

  const encodedABI = JSON.stringify(fnAbi);

  const tx = await chronos.createCron(
    target,
    encodedABI,
    method,
    [],
    interval,
    0, // no expiration
    400_000,
    ethers.utils.parseUnits("2", "gwei"),
    ethers.utils.parseEther(deposit),
    { gasLimit: 600_000 }
  );

  console.log("✅ Cron scheduled:", tx.hash);
}

main().catch(console.error);
