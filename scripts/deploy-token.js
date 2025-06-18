require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with address:", deployer.address);

  const Token = await ethers.getContractFactory("MyToken");
  const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1,000,000 AZR
  const token = await Token.deploy(initialSupply);

  await token.deployed();

  console.log("AZR Token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
