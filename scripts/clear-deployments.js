const fs = require("fs");
const path = require("path");
const readline = require("readline");

const deploymentsPath = path.join(__dirname, "../deployments.json");
const verificationPath = path.join(__dirname, "../verification");

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


async function main() {
    console.log("\nWhat would you like to clean up?");
    const choice = await ask(
`
1. Deployments log (deployments.json)
2. Verification files (verification/ folder)
3. Both

Enter number (1, 2, or 3): `
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
            console.log("\nCleaning up all logs and verification files...");
            deleteDeployments();
            deleteVerification();
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
