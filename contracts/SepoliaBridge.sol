// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMyToken {
    function mint(address to, uint256 amount) external;
}

contract SepoliaBridge {
    address public token;
    address public relayer;

    event MintedFromHelios(address indexed to, uint256 amount);

    constructor(address _token, address _relayer) {
        token = _token;
        relayer = _relayer;
    }

    function mintTo(address to, uint256 amount) external {
        require(msg.sender == relayer, "Not authorized");
        IMyToken(token).mint(to, amount);
        emit MintedFromHelios(to, amount);
    }
}
