const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../../deployments.json");

function loadLog() {
  if (!fs.existsSync(logFile)) return {};
  return JSON.parse(fs.readFileSync(logFile, "utf-8"));
}

function saveLog(data) {
  fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
}

async function logDeployment(name, address, txHash, tx) {
  const data = loadLog();
  const explorer = `https://explorer.helioschainlabs.org/tx/${txHash}`;
  const receipt = await tx.wait();
  const timestamp = new Date().toISOString();
  const blockNumber = receipt.blockNumber;

  data[name] = {
    address,
    tx: txHash,
    explorer,
    blockNumber,
    timestamp
  };

  saveLog(data);
  console.log(`📝 Saved '${name}' to deployments.json`);
}

module.exports = { logDeployment };
