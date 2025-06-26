const { exec } = require('child_process');
const fs = require('fs'); // Correctly import the 'fs' module
const path = require('path');

// --- Configuration ---
const TOTAL_RUNS_PER_DAY = 12;
const CHRONOS_CONTRACTS = [
    { logName: 'FeeCollector', requiredCount: 2 },
    { logName: 'DailyReporter', requiredCount: 2 }
];

// All available contracts for random deployment
const ALL_CONTRACT_LOG_NAMES = [
    'RandomToken', 'RandomNFT', 'AIAgent', 'HyperionQuery', 'Heartbeat',
    'FeeCollector', 'DailyReporter' 
];

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`\n> Executing: ${command}\n`);
        const childProcess = exec(command);

        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);

        childProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

function getDeploymentsFromLast24Hours() {
    const deploymentsPath = path.join(__dirname, '../deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        return [];
    }
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    return Object.values(deployments).filter(dep => {
        if (!dep.timestamp) return false;
        const deploymentDate = new Date(dep.timestamp);
        return deploymentDate > twentyFourHoursAgo;
    });
}

function getNextContractToDeploy() {
    const recentDeployments = getDeploymentsFromLast24Hours();
    console.log(`Found ${recentDeployments.length} deployments in the last 24 hours.`);

    // 1. Check if we need to deploy a mandatory Chronos contract
    for (const contract of CHRONOS_CONTRACTS) {
        const count = recentDeployments.filter(d => d.logName === contract.logName).length;
        console.log(`   - ${contract.logName} has been deployed ${count} times.`);
        if (count < contract.requiredCount) {
            console.log(`   -> Decision: Deploying mandatory contract: ${contract.logName}`);
            return contract.logName;
        }
    }

    // 2. If all mandatory deployments are done, pick a random contract
    const randomLogName = ALL_CONTRACT_LOG_NAMES[Math.floor(Math.random() * ALL_CONTRACT_LOG_NAMES.length)];
    console.log(`   -> Decision: Deploying random contract: ${randomLogName}`);
    return randomLogName;
}

async function main() {
    try {
        const logNameToDeploy = getNextContractToDeploy();
        if (!logNameToDeploy) {
            console.log("No contract to deploy at this time.");
            return;
        }

        const command = `npx hardhat deploy --log-name ${logNameToDeploy} --network heliosTestnet`;
        await executeCommand(command);
        console.log(`\n✅ Successfully completed deployment for ${logNameToDeploy}.`);

    } catch (error) {
        console.error('\n❌ An error occurred during the scheduled deployment:', error.message);
        process.exit(1);
    }
}

main();