# Helios Automated Deployer & Interaction Suite

This repository provides a powerful and flexible suite of tools for deploying and interacting with smart contracts on the **Helios Network**. It leverages a configuration-driven approach to automate the deployment of multiple contracts, including ERC20 tokens, ERC721 NFTs, and contracts that integrate with Helios's native AI and Chronos (cron job) precompiles.

The system is designed for rapid iteration and testing, with features like randomized contract parameters and selective deployments to streamline your development workflow.

---

## 🚀 Key Features

- **Automated, Config-Driven Deployment**: Deploy an entire suite of contracts with a single command based on a JSON configuration file.
- **Randomized Generation**: Automatically generate unique, thematic names, symbols, and supplies for tokens and NFTs on each run.
- **Selective Deployment**: Choose to deploy all contracts at once or target a single contract for quick updates and testing.
- **Precompile Integration**: Includes example contracts and scripts for interacting with Helios's powerful precompiles:
    - **AIAgent**: An on-chain agent that calls the AI precompile.
    - **Chronos Integration**: Schedule recurring tasks (cron jobs) for contracts like `FeeCollector` and `DailyReporter`.
- **Flexible Interaction**: A general-purpose script to call any function on any deployed contract.
- **Detailed Logging**: All deployments and their transaction details are automatically saved to `deployments.json`.

---

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

---

## ⚙️ Core Concept: The Deployment Config

The heart of this system is the `deployment-config-template.json` file. The deployment script uses this template to generate a new randomized `deployment-config.json` for each run.

- **`name`**: The name of the contract to deploy (e.g., `MyToken`).
- **`args`**: An array of constructor arguments for the contract. You can use `"deployerWallet"` or `"treasuryWallet"` as placeholders.
- **`logName`**: A static, unique identifier used for targeted deployments and logging.
- **`interactions`**: An array of post-deployment actions to perform, such as:
    - `mint`: Mint NFTs.
    - `call`: Call a specific function on the contract.
    - `chronos`: Schedule a recurring task using the Chronos precompile.

---

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

- **Deploy only the Token**:
  ```bash
  npm run deploy:token
  ```

- **Deploy only the NFT** (and mint 1 token):
  ```bash
  npm run deploy:nft
  ```

- **Deploy only the AI Agent** (and call the AI precompile):
  ```bash
  npm run deploy:agent
  ```

- **Deploy and schedule the Fee Collector**:
  ```bash
  npm run deploy:fee
  ```

- **Deploy and schedule the Daily Reporter**:
  ```bash
  npm run deploy:reporter
  ```

### General-Purpose Contract Interaction

After deploying your contracts, you can use the `interact` script to call any of their functions.

```bash
npm run interact
```

The script will prompt you for the contract name, its deployed address, the function you want to call, and any required arguments. This is a powerful tool for testing and managing your deployed contracts directly from the command line.

---

## 📁 Project Structure

```
helios-deployer/
│
├── contracts/
│   ├── AIAgent.sol          # Calls the Helios AI precompile.
│   ├── DailyReporter.sol    # Example for a scheduled task.
│   ├── FeeCollector.sol     # Example for a scheduled task.
│   ├── MyNFT.sol            # ERC721 NFT contract.
│   └── MyToken.sol          # ERC20 Token contract.
│
├── scripts/
│   ├── deploy.js            # Main deployment and interaction script.
│   ├── interact.js          # General-purpose contract interaction script.
│   └── utils/
│       └── logger.js        # Handles logging to deployments.json.
│
├── abi/
│   └── chronos.json         # ABI for the Chronos precompile.
│
├── .env                     # Your private keys and RPC URL (ignored by git).
├── .gitignore               # Files and folders to ignore.
├── deployment-config.json   # Auto-generated on each run with randomized values.
├── deployment-config-template.json # The base template for deployments.
├── deployments.json         # Stores addresses and hashes of deployed contracts.
├── hardhat.config.js        # Hardhat configuration.
├── package.json             # Project dependencies and scripts.
└── README.md                # You are here!
```

---

## 🪪 License

This project is licensed under the MIT License.