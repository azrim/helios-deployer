module.exports = async function deploySepoliaBridge(tokenAddress, relayer, hre) {
  const { ethers } = hre;
  const { logDeployment } = require("../scripts/utils/logger");

  console.log(`🚀 Deploying SepoliaBridge...`);
  const Bridge = await ethers.getContractFactory("SepoliaBridge");
  const bridge = await Bridge.deploy(tokenAddress, relayer);
  await bridge.deployed();

  const token = await ethers.getContractAt("MyToken", tokenAddress);
  await token.setBridge(bridge.address);
  console.log(`🔗 Token bridge set on MyToken at ${tokenAddress}`);

  await logDeployment("SepoliaBridge", bridge.address, bridge.deployTransaction.hash, bridge.deployTransaction, {
    token: tokenAddress,
    relayer,
  });
};
