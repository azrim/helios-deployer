// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {}

    /// @notice Mint a single NFT to `to`
    function safeMint(address to) public onlyOwner {
        _safeMint(to, _nextTokenId);
        _nextTokenId++;
    }

    /// @notice Mint `amount` NFTs to `to` in a loop
    function mintBatch(address to, uint256 amount) public onlyOwner {
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _nextTokenId);
            _nextTokenId++;
        }
    }

    /// @notice Get total minted supply so far
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
