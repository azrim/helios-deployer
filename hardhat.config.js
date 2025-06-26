require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { task } = require("hardhat/config");

// Define a new hardhat task for deploying contracts
task("deploy", "Deploys contracts based on the configuration")
  .addOptionalParam("logName", "The logName of a single contract to deploy")
  .setAction(async (taskArgs, hre) => {
    // This require is moved inside the action to avoid the HH9 error.
    const { deployContracts } = require("./scripts/deploy");
    await deployContracts(taskArgs.logName, hre);
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.24",
  networks: {
    heliosTestnet: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42000,
      ens: false
    },
  },
};