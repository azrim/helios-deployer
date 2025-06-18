// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMyNFT {
    function safeMint(address to) external;
}

contract ChronosController {
    address public nft;
    address public recipient;

    constructor(address _nft, address _recipient) {
        nft = _nft;
        recipient = _recipient;
    }

    function autoMint() external {
        IMyNFT(nft).safeMint(recipient);
    }

    function updateRecipient(address newRecipient) external {
        recipient = newRecipient;
    }
}
