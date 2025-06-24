const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../../deployments.json");

/**
 * Loads the deployment log file.
 * Creates an empty log file if it doesn't exist.
 * @returns {object} The parsed log data.
 */
function loadLog() {
    try {
        if (!fs.existsSync(logFile)) {
            // If the file doesn't exist, create it with an empty JSON object
            fs.writeFileSync(logFile, JSON.stringify({}, null, 2));
            return {};
        }
        const fileContent = fs.readFileSync(logFile, "utf-8");
        // Handle case where file is empty
        return fileContent ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error("❌ Error loading or parsing deployments.json:", error);
        // Return an empty object to prevent the script from crashing
        return {};
    }
}

/**
 * Saves data to the deployment log file.
 * @param {object} data The data to save.
 */
function saveLog(data) {
    try {
        fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Error writing to deployments.json:", error);
    }
}

/**
 * Logs the details of a deployment or interaction to deployments.json.
 * @param {string} name - The unique key for the log entry (e.g., "RandomToken" or "AIAgent_Interaction").
 * @param {string} address - The contract address involved.
 * @param {string} txHash - The transaction hash.
 * @param {object} tx - The full transaction object from ethers.js.
 * @param {object} [extraData={}] - An optional object for additional metadata (e.g., mint amount).
 */
async function logDeployment(name, address, txHash, tx, extraData = {}) {
    const data = loadLog();
    const explorer = `https://explorer.helioschainlabs.org/tx/${txHash}`;
    
    let blockNumber, timestamp;

    try {
        const receipt = await tx.wait();
        blockNumber = receipt.blockNumber;
        const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
        timestamp = new Date(block.timestamp * 1000).toISOString();
    } catch (error) {
        console.warn(`⚠️ Could not get receipt for tx ${txHash}. It may have failed.`);
        blockNumber = "N/A (pending or failed)";
        timestamp = new Date().toISOString();
    }


    data[name] = {
        address,
        tx: txHash,
        explorer,
        blockNumber,
        timestamp,
        ...extraData // Spread any extra data into the log entry
    };

    saveLog(data);
    console.log(`📝 Saved '${name}' to deployments.json`);
}

module.exports = { logDeployment };
