require("dotenv").config();
const { ethers } = require("hardhat");
const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function main() {
  const name = await ask("📛 Token name (e.g. Azrim Token): ");
  const symbol = await ask("🔤 Token symbol (e.g. AZR): ");
  const supplyRaw = await ask("💰 Initial supply (whole number): ");
  const supply = ethers.utils.parseUnits(supplyRaw, 18);

  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(name, symbol, supply);

  await token.deployed();

  console.log(`✅ ${name} (${symbol}) deployed to: ${token.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
