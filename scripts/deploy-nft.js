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

async function main() {
  const name = await ask("📛 NFT collection name (e.g. AzrimArt): ");
  const symbol = await ask("🔤 NFT symbol (e.g. AZNFT): ");

  const NFT = await ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy(name, symbol);
  const tx = nft.deployTransaction;

  await nft.deployed();

  console.log(`✅ NFT contract ${name} (${symbol}) deployed to: ${nft.address}`);
  console.log(`🔗 Explorer: https://explorer.helioschainlabs.org/tx/${tx.hash}`);

  await logDeployment(`NFT_${symbol}_${Date.now()}`, nft.address, tx.hash, tx, {
    collectionName: name,
    symbol
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
