const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { logDeployment } = require("./utils/logger");

// --- CONFIGURATION GENERATOR ---
function generateAndLoadConfig(hre) {
    const templateConfigPath = path.join(__dirname, "../deployment-config-template.json");
    const generatedConfigPath = path.join(__dirname, "../deployment-config.json");
    const promptsPath = path.join(__dirname, "../ai-prompts.json");

    console.log("🔧 Generating randomized deployment config from template...");
    if (!fs.existsSync(templateConfigPath)) {
        console.error("❌ deployment-config-template.json not found!");
        throw new Error("Template config not found.");
    }
    const template = JSON.parse(fs.readFileSync(templateConfigPath, "utf-8"));

    const tokenThemes = ["Relic", "Cypher", "Aura", "Vault", "Echo", "Flux", "Chrono", "Quantum", "Sage", "Magic", "Starlight", "Voidstone", "Helios", "Nova", "Rune", "Ghost", "Zenith", "Oracle", "Pulse", "Warp", "Astral", "Solaris", "Lunar", "Gale", "Ember", "Frost", "Terra", "Titan"];
    const nftThemes = ["Relics", "Cyphers", "Circuits", "Spirits", "Glyphs", "Echoes", "Shards", "Archives", "Dynasty", "Raze", "Chronicles", "Fragments", "Realms", "Visions", "Celestials", "Titans", "Warlords", "Ghosts", "Dragons", "Kings", "Empires", "Odysseys", "Legends", "Myths", "Prophecies", "Guardians"];
    const nftQualifiers = ["of Power", "of the Void", "of Light", "of the Ancients", "of the Future", "of Elysium", "of the Cosmos", "of the Abyss", "of Destiny", "of the Forgotten", "of Helios", "of the North", "of the Rising Sun", "of Eternal Night", "of the Crimson Dawn", "of the Azure Sky"];

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    template.contracts.forEach(contractConfig => {
        if (contractConfig.logName === "RandomToken") {
            const theme = randomChoice(tokenThemes);
            contractConfig.args[0] = `${theme} Token`;
            contractConfig.args[1] = theme.substring(0, 3).toUpperCase();
            const randomSupply = randomInt(1000000, 1000000000);
            contractConfig.args[2] = hre.ethers.utils.parseUnits(randomSupply.toString(), 18).toString();
        }
        if (contractConfig.logName === "RandomNFT") {
            const theme = randomChoice(nftThemes);
            const qualifier = randomChoice(nftQualifiers);
            contractConfig.args[0] = `${theme} ${qualifier}`;
            contractConfig.args[1] = theme.substring(0, 4).toUpperCase();
            if (contractConfig.interactions[0] && contractConfig.interactions[0].type === "mint") {
                contractConfig.interactions[0].amount = randomInt(1, 3);
            }
        }
        if (contractConfig.logName === "AIAgent") {
             if (fs.existsSync(promptsPath)) {
                const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf-8"));
                if (contractConfig.interactions[0]) {
                   contractConfig.interactions[0].args[1] = randomChoice(prompts);
                }
            }
        }
    });

    fs.writeFileSync(generatedConfigPath, JSON.stringify(template, null, 2));
    console.log("✅ New deployment-config.json has been generated for this run.");
    return template;
}

function resolveAddress(arg, wallets) {
  if (arg === "deployerWallet") return wallets.deployer;
  if (arg === "treasuryWallet") return wallets.treasury;
  return arg;
}

async function main() {
    const config = generateAndLoadConfig(hre);

    const contractLogName = process.env.CONTRACT_LOG_NAME;

    let contractsToProcess = config.contracts;

    if (contractLogName) {
        console.log(`\n🎯 Targeting deployment for a single contract: ${contractLogName}`);
        contractsToProcess = config.contracts.filter(c => c.logName === contractLogName);

        if (contractsToProcess.length === 0) {
            console.error(`\n❌ Error: No contract found with logName "${contractLogName}" in deployment-config-template.json.`);
            const availableNames = config.contracts.map(c => c.logName).join(', ');
            console.log(`   Available logNames are: [${availableNames}]`);
            process.exit(1);
        }
    } else {
        console.log('\n✨ Deploying all contracts as per configuration.');
    }

    console.log("\n🚀 Starting automated deployment...");

    if (config.deployerWallet === "your_wallet_address_here") {
        console.error("❌ Please set your wallet address in deployment-config-template.json before running.");
        process.exit(1);
    }

    const [deployer] = await hre.ethers.getSigners();
    const wallets = {
        deployer: config.deployerWallet,
        treasury: config.treasuryWallet,
    };

    console.log(`Deployer Address: ${wallets.deployer}`);
    console.log("----------------------------------------------------");

    const deployedContracts = {};

    for (const contractConfig of contractsToProcess) {
        try {
            console.log(`\n📦 Deploying ${contractConfig.name} (logName: ${contractConfig.logName})...`);
            const ContractFactory = await hre.ethers.getContractFactory(contractConfig.name);
            const constructorArgs = contractConfig.args.map(arg => resolveAddress(arg, wallets));
            
            const contract = await ContractFactory.deploy(...constructorArgs);
            await contract.deployed();

            console.log(`✅ ${contractConfig.name} deployed to: ${contract.address}`);
            
            // --- UPDATED LOGIC ---
            // Use the dynamic name for tokens/NFTs, otherwise use the static logName.
            let logKey = contractConfig.logName;
            if (contractConfig.logName === "RandomToken" || contractConfig.logName === "RandomNFT") {
                logKey = constructorArgs[0]; // The first constructor argument is the dynamic name.
            }
            // --- END UPDATED LOGIC ---

            await logDeployment(logKey, contract.address, contract.deployTransaction.hash, contract.deployTransaction);
            deployedContracts[contractConfig.name] = contract;
        } catch (error) {
            console.error(`❌ Failed to deploy ${contractConfig.name}:`, error.message);
            process.exit(1);
        }
    }

    console.log("\n----------------------------------------------------");
    console.log("⚙️  Running post-deployment interactions...");
    console.log("----------------------------------------------------");

    for (const contractConfig of contractsToProcess) {
        if (!contractConfig.interactions || !deployedContracts[contractConfig.name]) {
            continue;
        }

        const contract = deployedContracts[contractConfig.name];
        console.log(`\n🎬 Interacting with ${contractConfig.name} at ${contract.address}`);

        for (const interaction of contractConfig.interactions) {
            try {
                let interactionArgs = interaction.args ? interaction.args.map(arg => resolveAddress(arg, wallets)) : [];

                if (interaction.type === "mint") {
                    console.log(`   -> Minting ${interaction.amount} NFTs...`);
                    const recipient = resolveAddress(interaction.recipient, wallets);
                    const tx = await contract.mintBatch(recipient, interaction.amount);
                    await tx.wait();
                    console.log(`   ✅ Mint successful! Tx: ${tx.hash}`);
                } else if (interaction.type === "call") {
                    console.log(`   -> Calling '${interaction.functionName}' with args: [${interactionArgs.join(', ')}]`);
                    
                    const txOptions = {};
                    if (interaction.value) {
                        txOptions.value = hre.ethers.utils.parseEther(interaction.value);
                        console.log(`       ...with value: ${interaction.value} HLS`);
                    }
                    if (interaction.gasLimit) {
                        txOptions.gasLimit = interaction.gasLimit;
                        console.log(`       ...with gasLimit: ${interaction.gasLimit}`);
                    }
                    
                    const tx = await contract[interaction.functionName](...interactionArgs, txOptions);
                    const receipt = await tx.wait();
                    
                    console.log(`   ✅ Transaction confirmed! Hash: ${tx.hash}`);

                    const responseEvent = receipt.events?.find(e => e.event === 'AIResponse');
                    const errorEvent = receipt.events?.find(e => e.event === 'AIError');

                    if (responseEvent) {
                        console.log("\n   🔔 AI Response Received:");
                        console.log(`      - Response: ${responseEvent.args.response}`);
                    } else if (errorEvent) {
                        console.error("\n   ❌ AI Interaction Failed. The precompile returned an error:");
                        const reason = hre.ethers.utils.toUtf8String(errorEvent.args.reason);
                        console.error(`      - Revert Reason: ${reason}`);
                    } else {
                        console.warn("\n   ⚠️ No AIResponse or AIError event was detected.");
                    }

                } else if (interaction.type === "chronos") {
                    console.log(`   -> Scheduling CRON for '${interaction.functionName}'...`);
                    const chronosABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../abi/chronos.json"), "utf-8")).abi;
                    const chronos = new hre.ethers.Contract("0x0000000000000000000000000000000000000830", chronosABI, deployer);
                    const artifact = await hre.artifacts.readArtifact(contractConfig.name);
                    
                    const tx = await chronos.createCron(
                        contract.address, JSON.stringify(artifact.abi), interaction.functionName,
                        interactionArgs, interaction.frequency, 0, 400000,
                        hre.ethers.utils.parseUnits("2", "gwei"),
                        hre.ethers.utils.parseEther(interaction.deposit),
                        { gasLimit: 600000 }
                    );
                    await tx.wait();
                    console.log(`   ✅ CRON task scheduled! Tx: ${tx.hash}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed interaction '${interaction.type}' for ${contractConfig.name}:`, error.message);
            }
        }
    }

    console.log("\n----------------------------------------------------");
    console.log("🎉 Automated deployment and setup complete!");
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
