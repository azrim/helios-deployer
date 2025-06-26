const fs = require("fs");
const path = require("path");
const readline = require("readline");
const hre = require("hardhat");

const deploymentsPath = path.join(__dirname, "../deployments.json");
const verificationPath = path.join(__dirname, "../verification");
const nodeModulesPath = path.join(__dirname, "../node_modules");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function deleteDeployments() {
    if (fs.existsSync(deploymentsPath)) {
        fs.unlinkSync(deploymentsPath);
        console.log("🗑️  deployments.json has been deleted.");
    } else {
        console.log("✅ deployments.json does not exist, no action needed.");
    }
}

function deleteVerification() {
    if (fs.existsSync(verificationPath)) {
        fs.rmSync(verificationPath, { recursive: true, force: true });
        console.log("🗑️  The 'verification' folder has been deleted.");
    } else {
        console.log("✅ The 'verification' folder does not exist, no action needed.");
    }
}

function deleteNodeModules() {
    if (fs.existsSync(nodeModulesPath)) {
        console.log("🔥 Deleting node_modules... (this might take a moment)");
        fs.rmSync(nodeModulesPath, { recursive: true, force: true });
        console.log("🗑️  The 'node_modules' folder has been deleted.");
        console.log("   -> Run 'npm install' to reinstall dependencies.");
    } else {
        console.log("✅ The 'node_modules' folder does not exist, no action needed.");
    }
}

async function cleanHardhatCache() {
    console.log("✨ Cleaning Hardhat cache and artifacts...");
    await hre.run("clean");
    console.log("✅ Hardhat cache and artifacts have been cleared.");
}

async function main() {
    console.log("\nWhat would you like to clean up?");
    const choice = await ask(
`
1. Deployments log (deployments.json)
2. Verification files (verification/ folder)
3. Hardhat cache & artifacts (npx hardhat clean)
4. Everything (logs, verification, cache)
5. NUKE: Everything + node_modules

Enter number (1-5): `
    );

    switch(choice) {
        case '1':
            console.log("\nCleaning up deployments log...");
            deleteDeployments();
            break;
        case '2':
            console.log("\nCleaning up verification files...");
            deleteVerification();
            break;
        case '3':
            await cleanHardhatCache();
            break;
        case '4':
            console.log("\nCleaning up all logs, verification files, and cache...");
            deleteDeployments();
            deleteVerification();
            await cleanHardhatCache();
            break;
        case '5':
            console.log("\n☢️  Nuking the project state...");
            deleteDeployments();
            deleteVerification();
            await cleanHardhatCache();
            deleteNodeModules();
            break;
        default:
            console.log("\n❌ Invalid option. No files were deleted.");
    }
    console.log("");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});