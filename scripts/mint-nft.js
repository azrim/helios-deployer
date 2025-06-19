const hre = require("hardhat");
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
  const contractAddress = await ask("🏛️ Enter deployed NFT contract address: ");
  const recipient = await ask("👤 Enter recipient wallet address: ");

  const NFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await NFT.attach(contractAddress);

  const tx = await nft.safeMint(recipient);
  console.log("🚀 Minting NFT...");

  const receipt = await tx.wait();
  console.log(`✅ Minted NFT to ${recipient}`);
  console.log(`🔗 Explorer: https://explorer.helioschainlabs.org/tx/${receipt.transactionHash}`);
  await logDeployment(`NFTMint_${symbol}_${Date.now()}`, nft.address, tx.hash, tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
