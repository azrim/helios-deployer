// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for the Hyperion Light Client Precompile
interface IHyperion {
    function getBlockNumber(string calldata chain) external view returns (uint256);
}

/**
 * @title HyperionQuery
 * @dev This contract demonstrates Helios's Cross-Chain Oracle capabilities
 * by querying data from another blockchain via the Hyperion precompile.
 */
contract HyperionQuery is Ownable {
    // Address of the Hyperion precompile on the Helios network
    IHyperion constant hyperion = IHyperion(0x0000000000000000000000000000000000000831);
    
    uint256 public lastQueriedBlockNumber;
    string public targetChain;

    event BlockNumberUpdated(string chain, uint256 blockNumber);

    constructor(string memory _targetChain, address initialOwner) Ownable(initialOwner) {
        targetChain = _targetChain;
    }

    /**
     * @dev Queries the Hyperion precompile for the latest block number of the target chain
     * and stores it in the `lastQueriedBlockNumber` state variable.
     */
    function updateBlockNumber() public {
        uint256 blockNumber = hyperion.getBlockNumber(targetChain);
        lastQueriedBlockNumber = blockNumber;
        emit BlockNumberUpdated(targetChain, blockNumber);
    }
    
    /**
     * @dev Allows the owner to change the target blockchain to query.
     * @param _newChain The name of the new chain (e.g., "Sepolia").
     */
    function setTargetChain(string memory _newChain) public onlyOwner {
        targetChain = _newChain;
    }
}
