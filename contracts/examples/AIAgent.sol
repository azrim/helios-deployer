// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for the AI Oracle Precompile
interface IAIAgent {
    function prompt(string calldata model, string calldata message) external returns (string memory);
}

/**
 * @title AIAgent
 * @dev This contract demonstrates how to interact with an on-chain AI Agent
 * through the AI precompile on the Helios network.
 */
contract AIAgent is Ownable {
    // Address of the AI Agent precompile on the Helios network
    IAIAgent constant aiAgent = IAIAgent(0x0000000000000000000000000000000000000832);
    
    string public lastResponse;

    event PromptSent(address indexed sender, string model, string prompt);
    event ResponseReceived(string response);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Sends a prompt to the specified AI model and stores the response.
     * @param model The name of the AI model to use (e.g., "llama3").
     * @param promptMessage The prompt to send to the AI model.
     */
    function askAI(string calldata model, string calldata promptMessage) public {
        emit PromptSent(msg.sender, model, promptMessage);
        string memory response = aiAgent.prompt(model, promptMessage);
        lastResponse = response;
        emit ResponseReceived(response);
    }
}
