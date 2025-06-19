const fs = require("fs");
const path = require("path");

const artifacts = [
  "HeliosBridge",
  "SepoliaBridge",
  "MyToken"
];

function exportAbis() {
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir);

  for (const name of artifacts) {
    const artifact = require(`../artifacts/contracts/${name}.sol/${name}.json`);
    const abiPath = path.join(abiDir, `${name}.json`);
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`✅ Exported ABI: ${name}`);
  }
}

exportAbis();
