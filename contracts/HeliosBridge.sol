// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMyToken {
    function burn(address from, uint256 amount) external;
}

contract HeliosBridge {
    address public token;
    address public admin;

    event BridgedToSepolia(address indexed user, uint256 amount);

    constructor(address _token) {
        token = _token;
        admin = msg.sender;
    }

    function bridgeToSepolia(uint256 amount) external {
        IMyToken(token).burn(msg.sender, amount);
        emit BridgedToSepolia(msg.sender, amount);
    }
}
