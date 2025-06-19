// Generate ABI file correctly using this utility
const fs = require("fs");
const artifacts = require("hardhat").artifacts;

async function generateAbi(name, outPath) {
  const artifact = await artifacts.readArtifact(name);
  fs.writeFileSync(outPath, JSON.stringify({ abi: artifact.abi }, null, 2));
}

// Example usage:
generateAbi("SepoliaBridge", "./abi/SepoliaBridge.json");
generateAbi("HeliosBridge", "./abi/HeliosBridge.json");
