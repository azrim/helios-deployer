module.exports = async function deployHeliosBridge(tokenAddress, hre) {
  const { ethers } = hre;
  const { logDeployment } = require("../scripts/utils/logger");

  console.log(`🚀 Deploying HeliosBridge...`);
  const Bridge = await ethers.getContractFactory("HeliosBridge");
  const bridge = await Bridge.deploy(tokenAddress);
  await bridge.deployed();

  const token = await ethers.getContractAt("MyToken", tokenAddress);
  await token.setBridge(bridge.address);
  console.log(`🔗 Token bridge set on MyToken at ${tokenAddress}`);

  await logDeployment("HeliosBridge", bridge.address, bridge.deployTransaction.hash, bridge.deployTransaction, {
    token: tokenAddress,
  });
};
