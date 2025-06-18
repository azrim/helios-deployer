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
  const name = await ask("📛 NFT collection name (e.g. AzrimArt): ");
  const symbol = await ask("🔤 NFT symbol (e.g. AZNFT): ");

  const NFT = await ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy(name, symbol);
  const txHash = nft.deployTransaction.hash;

  await nft.deployed();

  console.log(`✅ NFT contract ${name} (${symbol}) deployed to: ${nft.address}`);
  console.log(`🔗 Explorer: https://explorer.helioschainlabs.org/tx/${txHash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
