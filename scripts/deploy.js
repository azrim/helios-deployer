const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { logDeployment } = require("./utils/logger");

const templateConfigPath = path.join(__dirname, "../deployment-config-template.json");
const generatedConfigPath = path.join(__dirname, "../deployment-config.json");
const promptsPath = path.join(__dirname, "../ai-prompts.json");

// --- CONFIGURATION GENERATOR ---
function generateAndLoadConfig() {
    console.log("🔧 Generating randomized deployment config from template...");
    if (!fs.existsSync(templateConfigPath)) {
        console.error("❌ deployment-config-template.json not found!");
        throw new Error("Template config not found.");
    }
    const template = JSON.parse(fs.readFileSync(templateConfigPath, "utf-8"));

    // --- NEW: Thematic name lists ---
    const tokenThemes = ["Relic", "Cypher", "Aura", "Vault", "Echo", "Flux", "Chrono", "Quantum", "Sage", "Magic"];
    const nftThemes = ["Relics", "Cyphers", "Circuits", "Spirits", "Glyphs", "Echoes", "Shards", "Archives", "Dynasty", "Raze"];
    const nftQualifiers = ["of Power", "of the Void", "of Light", "of the Ancients", "of the Future", "of Elysium"];

    // Random data helpers
    const randomSuffix = () => Math.floor(100 + Math.random() * 900); // 3-digit number
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Randomize arguments but keep logName static
    template.contracts.forEach(contractConfig => {
        if (contractConfig.name === "MyToken") {
            const theme = randomChoice(tokenThemes);
            contractConfig.args[0] = `${theme} Token`; // e.g., "Cypher Token"
            contractConfig.args[1] = theme.substring(0, 3).toUpperCase(); // e.g., "CYP"
        }
        if (contractConfig.name === "MyNFT") {
            const theme = randomChoice(nftThemes);
            const qualifier = randomChoice(nftQualifiers);
            contractConfig.args[0] = `${theme} ${qualifier}`; // e.g., "Magic of the Void"
            contractConfig.args[1] = theme.substring(0, 4).toUpperCase(); // e.g., "MAGI"
            if (contractConfig.interactions[0]) {
                contractConfig.interactions[0].amount = randomInt(1, 10);
            }
        }
        if (contractConfig.name === "AIAgent") {
             if (fs.existsSync(promptsPath)) {
                const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf-8"));
                if (contractConfig.interactions[0]) {
                   contractConfig.interactions[0].args[1] = randomChoice(prompts);
                }
            }
        }
    });

    // Write the new randomized config to be used by this run
    fs.writeFileSync(generatedConfigPath, JSON.stringify(template, null, 2));
    console.log("✅ New deployment-config.json has been generated for this run.");
    return template;
}

// Helper to replace placeholder wallet addresses
function resolveAddress(arg, wallets) {
  if (arg === "deployerWallet") return wallets.deployer;
  if (arg === "treasuryWallet") return wallets.treasury;
  return arg;
}

async function main() {
  const config = generateAndLoadConfig(); 

  console.log("🚀 Starting automated deployment...");

  // --- VALIDATION ---
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

  // --- 1. DEPLOY CONTRACTS ---
  for (const contractConfig of config.contracts) {
    try {
      console.log(`\n📦 Deploying ${contractConfig.name} with args: [${contractConfig.args.join(', ')}]`);
      const ContractFactory = await hre.ethers.getContractFactory(contractConfig.name);
      const constructorArgs = contractConfig.args.map(arg => resolveAddress(arg, wallets));
      
      const contract = await ContractFactory.deploy(...constructorArgs);
      await contract.deployed();

      console.log(`✅ ${contractConfig.name} deployed to: ${contract.address}`);
      // Use the static logName from the template for consistent logging
      await logDeployment(contractConfig.logName, contract.address, contract.deployTransaction.hash, contract.deployTransaction);
      deployedContracts[contractConfig.name] = contract;
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractConfig.name}:`, error.message);
    }
  }

  console.log("\n----------------------------------------------------");
  console.log("⚙️  Running post-deployment interactions...");
  console.log("----------------------------------------------------");

  // --- 2. RUN INTERACTIONS ---
  for (const contractConfig of config.contracts) {
    if (!contractConfig.interactions || !deployedContracts[contractConfig.name]) {
      continue;
    }

    const contract = deployedContracts[contractConfig.name];
    console.log(`\n🎬 Interacting with ${contractConfig.name} at ${contract.address}`);

    for (const interaction of contractConfig.interactions) {
        try {
            let interactionArgs = [];
            if (interaction.args && Array.isArray(interaction.args)) {
                interactionArgs = interaction.args.map(arg => resolveAddress(arg, wallets));
            }

            if (interaction.type === "mint") {
                console.log(`   -> Minting ${interaction.amount} NFTs...`);
                const recipient = resolveAddress(interaction.recipient, wallets);
                const tx = await contract.mintBatch(recipient, interaction.amount);
                await tx.wait();
                console.log(`   ✅ Mint successful! Tx: ${tx.hash}`);
            } else if (interaction.type === "call") {
                console.log(`   -> Calling '${interaction.functionName}' with args: [${interactionArgs.join(', ')}]`);
                const tx = await contract[interaction.functionName](...interactionArgs);
                await tx.wait();
                console.log(`   ✅ Call successful! Tx: ${tx.hash}`);
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
