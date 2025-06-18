# Helios Deployer

This repository contains scripts for deploying ERC-20 tokens and smart contracts to the [Helios Chain Testnet](https://hub.helioschain.network/).

## 🚀 Features

- Deploy your own token
- Ready for general smart contract deployments
- Uses Hardhat + Ethers.js
- Environment variable support via `.env`

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/helios-deployer.git
cd helios-deployer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=helios_rpc_here
```

> ⚠️ Use a wallet with testnet funds. Never share this file or commit it to Git.

---

## 📦 Deploying Your Token (AZR)

This deploys a 1 million supply ERC-20 token named `Azrim Token` with symbol `AZR`.

```bash
npm run deploy:token
```

Output:

```
Deploying contract with address: 0x...
AZR Token deployed to: 0x...
```

---

## 📦 Deploying Any Smart Contract

You can deploy any contract stored in the `contracts/` folder using the generic deployer script.

### 🧾 Example

For a contract like `contracts/HelloWorld.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloWorld {
    string public greet = "Hello Helios!";
}
```

### ▶️ Option 1: With prompt (interactive)

```bash
npm run deploy:contract
```

You'll be asked:

```
🔤 Enter contract name to deploy (without .sol): HelloWorld
```

### ▶️ Option 2: Set via environment variable

```bash
CONTRACT=HelloWorld npm run deploy:contract
```

> 🔒 No need to change the script for each contract — just update the name.

---

## 📁 Project Structure

```
helios-deployer/
│
├── contracts/
│   └── MyToken.sol          # ERC-20 token contract
|   └── HelloWorld.sol       # Generic contract
│
├── scripts/
│   └── deploy-token.js      # Deployment script for AZR token
│   └── deploy-contract.js   # Deployment script for contract
│
├── .env                     # Private key + RPC config
├── .gitignore               # Prevents .env and cache files from being tracked
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies and scripts
└── README.md                # You are here!
```

---

## 🧪 Coming Soon

- General contract deployment support
- Contract verification
- Frontend integration for Web3 interaction

---

## 🧠 Resources

- [Helios Docs](https://hub.helioschain.network/docs/)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

## 🪪 License

[MIT](LICENSE)