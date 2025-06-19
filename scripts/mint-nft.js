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
  const amountRaw = await ask("🔢 How many NFTs to mint?: ");
  const amount = parseInt(amountRaw);

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Invalid amount entered.");
    process.exit(1);
  }

  const NFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await NFT.attach(contractAddress);
  const symbol = await nft.symbol();

  let tx;

  if (amount === 1) {
    tx = await nft.safeMint(recipient);
  } else {
    tx = await nft.mintBatch(recipient, amount);
  }

  const receipt = await tx.wait();

  console.log(`✅ Minted ${amount} NFT${amount > 1 ? "s" : ""} to ${recipient}`);
  console.log(`🔗 Explorer: https://explorer.helioschainlabs.org/tx/${tx.hash}`);

  await logDeployment(`NFTMint_${symbol}_${Date.now()}`, nft.address, tx.hash, tx, {
    mintAmount: amount,
    recipient
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
