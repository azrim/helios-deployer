const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../../deployments.json");

function loadLog() {
    try {
        if (!fs.existsSync(logFile)) {
            fs.writeFileSync(logFile, JSON.stringify({}, null, 2));
            return {};
        }
        const fileContent = fs.readFileSync(logFile, "utf-8");
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error("❌ Error loading or parsing deployments.json:", error);
        return {};
    }
}

function saveLog(data) {
    try {
        const replacer = (key, value) =>
            typeof value === 'bigint' ? value.toString() : value;
        fs.writeFileSync(logFile, JSON.stringify(data, replacer, 2));
    } catch (error) {
        console.error("❌ Error writing to deployments.json:", error);
    }
}

/**
 * Logs the details of a deployment to deployments.json.
 * @param {string} name - The unique key for the log entry.
 * @param {object} deploymentData - The pre-constructed object containing deployment info.
 * @param {object} tx - The full transaction object from ethers.js.
 * @param {object} hre - The Hardhat Runtime Environment.
 */
async function logDeployment(name, deploymentData, tx, hre) {
    const data = loadLog();
    
    try {
        const receipt = await tx.wait();
        const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
        
        // Add transaction and block details to the deployment data
        deploymentData.tx = tx.hash;
        deploymentData.explorer = `https://explorer.helioschainlabs.org/tx/${tx.hash}`;
        deploymentData.blockNumber = receipt.blockNumber;
        deploymentData.timestamp = new Date(block.timestamp * 1000).toISOString();

    } catch (error) {
        console.warn(`⚠️ Could not get receipt for tx ${tx.hash}. It may have failed.`);
        deploymentData.blockNumber = "N/A (pending or failed)";
        deploymentData.timestamp = new Date().toISOString();
    }

    data[name] = deploymentData;

    saveLog(data);
    console.log(`📝 Saved '${name}' to deployments.json`);
}

module.exports = { logDeployment };