const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../deployments.json");

if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  console.log("🗑️  deployments.json has been deleted.");
} else {
  console.log("⚠️  deployments.json does not exist.");
}
