const hre = require("hardhat");
const readline = require("readline");

// Helper function for asking command-line questions
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

// Main interaction logic
async function main() {
  // 1. Get contract details from user
  const contractName = await ask("Enter the contract name (e.g., AIAgent, MyToken): ");
  const contractAddress = await ask(`Enter the deployed address for ${contractName}: `);

  // 2. Get contract factory and attach to the deployed instance
  let contract;
  try {
    const ContractFactory = await hre.ethers.getContractFactory(contractName);
    contract = ContractFactory.attach(contractAddress);
  } catch (e) {
    console.error(`\n❌ Could not find or attach to contract '${contractName}'.`);
    console.error("Please ensure the contract name is correct and it has been compiled.");
    process.exit(1);
  }

  console.log(`\n✅ Attached to ${contractName} at ${contract.address}`);

  // 3. Parse the ABI to find available functions
  const functions = contract.interface.fragments
    .filter((fragment) => fragment.type === "function")
    .map((fragment, index) => ({
      index,
      name: fragment.name,
      inputs: fragment.inputs,
      stateMutability: fragment.stateMutability,
    }));

  if (functions.length === 0) {
    console.log("No functions found in the contract ABI.");
    return;
  }

  // 4. Main interaction loop
  while (true) {
    console.log("\nAvailable Functions:");
    functions.forEach((func) => {
      const inputTypes = func.inputs.map(i => `${i.type} ${i.name}`).join(', ');
      const type = func.stateMutability === 'view' || func.stateMutability === 'pure' ? '[read]' : '[write]';
      console.log(`  ${func.index}: ${func.name}(${inputTypes}) ${type}`);
    });
     console.log("  exit: Exit the script");


    const choice = await ask("\nSelect a function to call by its number (or type 'exit'): ");
    if (choice.toLowerCase() === 'exit') {
        console.log("👋 Exiting script.");
        break;
    }

    const funcIndex = parseInt(choice, 10);
    if (isNaN(funcIndex) || funcIndex < 0 || funcIndex >= functions.length) {
      console.error("Invalid selection. Please try again.");
      continue;
    }

    const selectedFunc = functions[funcIndex];
    const args = [];

    // 5. Prompt for function arguments
    for (const input of selectedFunc.inputs) {
      const val = await ask(`  -> Enter value for '${input.name}' (${input.type}): `);
      args.push(val);
    }
    
    let amountToSend = "0";
    if (selectedFunc.stateMutability === 'payable') {
        amountToSend = await ask(`  -> This is a payable function. Enter amount in HLS to send (e.g., '0.1'): `);
    }

    try {
      console.log(`\n... Calling ${selectedFunc.name}(${args.join(", ")})...`);
      
      // 6. Execute function (read or write)
      if (selectedFunc.stateMutability === "view" || selectedFunc.stateMutability === "pure") {
        // It's a read-only call
        const result = await contract[selectedFunc.name](...args);
        console.log("\n✅ Result:");
        console.log(result);
      } else {
        // It's a state-changing transaction
        const tx = await contract[selectedFunc.name](...args, {
            value: hre.ethers.utils.parseEther(amountToSend)
        });
        console.log(`  Submitting transaction... (hash: ${tx.hash})`);
        
        await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log(`🔗 Explorer: https://explorer.helioschainlabs.org/tx/${tx.hash}`);
      }
    } catch (error) {
      console.error(`\n❌ Error calling function: ${error.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
