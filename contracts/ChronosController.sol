// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMyNFT {
    function safeMint(address to) external;
    function mintBatch(address to, uint256 amount) external;
}

contract ChronosController {
    address public nft;
    address public recipient;

    constructor(address _nft, address _recipient) {
        nft = _nft;
        recipient = _recipient;
    }

    function autoMint(uint256 amount) external {
        if (amount == 1) {
            IMyNFT(nft).safeMint(recipient); // ✅ Cast correctly
        } else {
            IMyNFT(nft).mintBatch(recipient, amount); // ✅ Optional
        }
    }
}
