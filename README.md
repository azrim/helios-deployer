# Helios Automated Deployer & Interaction Suite

![Visitor Count](https://api.visitorbadge.io/api/VisitorHit?user=azrim&repo=helios-deployer&countColor=%237B1E7A)

This repository provides a powerful and flexible suite of tools for deploying and interacting with smart contracts on the **Helios Network**. It leverages a configuration-driven approach to automate the deployment of multiple contracts, including ERC20 tokens, ERC721 NFTs, and contracts that integrate with Helios's native AI and Chronos (cron job) precompiles.

The system is designed for rapid iteration and testing, with features like randomized contract parameters, selective deployments, and an automated contract verification helper to streamline your development workflow.

## 🚀 Key Features

* **Automated, Config-Driven Deployment**: Deploy an entire suite of contracts with a single command based on a JSON configuration file.

* **Randomized Generation**: Automatically generate unique, thematic names, symbols, and supplies for tokens and NFTs on each run.

* **Selective Deployment**: Choose to deploy all contracts at once or target a single contract for quick updates and testing.

* **Automated Contract Verification**: A helper script that prepares all the necessary files for contract verification on the block explorer using the "Standard-JSON-Input" method.

* **Precompile Integration**: Includes example contracts and scripts for interacting with Helios's powerful precompiles:

  * **AIAgent**: An on-chain agent that calls the AI precompile.

  * **Chronos Integration**: Schedule recurring tasks (cron jobs) for contracts like `FeeCollector` and `DailyReporter`.

* **Detailed Logging**: All deployments, including their constructor arguments, are automatically saved to `deployments.json`, ensuring verification is always possible.

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/azrim/helios-deployer.git
cd helios-deployer
```

### 2. Install Dependencies

This project uses `cross-env` for cross-platform compatibility.

```bash
npm install
```

### 3. Configure Your Environment

Create a `.env` file in the root of the project and add your private key and the Helios RPC URL.

```env
# .env
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL=https://replace_with_rpc_url
```

> **Security Warning**: The `.env` file is included in `.gitignore` for safety. **Never commit this file or share your private key.** Use a dedicated development wallet with testnet funds only.

## ⚙️ Core Concept: The Deployment Config

The heart of this system is the `deployment-config-template.json` file. The deployment script uses this template to generate a new randomized `deployment-config.json` for each run.

* **`name`**: The name of the contract to deploy (e.g., `MyToken`).

* **`args`**: An array of constructor arguments for the contract. You can use `"deployerWallet"` or `"treasuryWallet"` as placeholders.

* **`logName`**: A static, unique identifier used for targeted deployments and logging.

* **`interactions`**: An array of post-deployment actions to perform, such as `mint` or `call`.

## USAGE

### Automated Deployment

The deployment script allows you to deploy either all contracts defined in the configuration or a single, specific contract.

#### Deploying All Contracts

This command reads the configuration, generates randomized parameters, and deploys every contract in the list.

```bash
npm run deploy
```

#### Selective Deployment

To save time, you can deploy and interact with just one contract by using its specific `npm` script. The script targets the contract based on its `logName` in the configuration file.

* **Deploy only the Token**:

  ```bash
  npm run deploy:token
  ```

* **Deploy only the NFT** (and mint 1 token):

  ```bash
  npm run deploy:nft
  ```

* **Deploy other contracts**:

  ```bash
  npm run deploy:agent
  npm run deploy:fee
  npm run deploy:reporter
  ```

### Contract Verification

After deploying a contract, you can easily prepare the files needed for verification on the block explorer.

1. **Run the verification helper**:

   ```bash
   npm run verify:prepare
   ```

2. **Choose the contract** you want to verify from the list of your recent deployments.

3. The script will create a `verification/` directory containing two files:

   * `[ContractName]_standard_input.json`: The file you will upload to the explorer.

   * `[ContractName]_args.json`: Contains the ABI-encoded constructor arguments for you to copy.

4. Follow the instructions printed in the terminal to complete the verification process on the Helios Explorer.

### General-Purpose Contract Interaction

After deploying your contracts, you can use the `interact` script to call any of their functions.

```bash
npm run interact
```

The script will prompt you for the contract name, its deployed address, the function you want to call, and any required arguments.

## 📁 Project Structure

```
helios-deployer/
│
├── contracts/
│   ├── AIAgent.sol
│   ├── DailyReporter.sol
│   ├── FeeCollector.sol
│   ├── MyNFT.sol
│   └── MyToken.sol
│
├── scripts/
│   ├── deploy.js
│   ├── interact.js
│   ├── prepare-verification.js  # Verification helper script.
│   └── utils/
│       └── logger.js
│
├── verification/              # Auto-generated folder for verification files.
│
├── .env
├── deployment-config-template.json
├── deployments.json
├── hardhat.config.js
├── package.json
└── README.md
```

## 🪪 License

This project is licensed under the MIT License.