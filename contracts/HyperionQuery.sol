// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IHyperion
 * @notice Interface for the Hyperion precompile (0x0831).
 * @dev This interface defines the functions available to query on-chain historical data.
 */
interface IHyperion {
    /**
     * @notice Performs a generic query against the Hyperion indexer.
     * @param query The JSON-formatted query string.
     * @return result The JSON-formatted result string.
     */
    function query(string calldata query) external view returns (string memory result);

    /**
     * @notice A more structured query function.
     * @param endpoint The API endpoint to query (e.g., "v2/history/get_actions").
     * @param params The query parameters as a JSON string.
     * @return result The JSON-formatted result string.
     */
    function queryJson(string calldata endpoint, string calldata params) external view returns (string memory result);
}

/**
 * @title HyperionQuery
 * @author Azrim
 * @notice A contract to interact with the official Hyperion precompile on the Helios network.
 * @dev This contract acts as a wrapper to call the precompile at 0x0831 and emit events
 * with the results, making them accessible to off-chain clients.
 */
contract HyperionQuery {
    // The constant address of the Hyperion precompile.
    IHyperion constant hyperion = IHyperion(0x0000000000000000000000000000000000000831);

    address public owner;

    // Event to log the results of a successful query.
    event HyperionResponse(string result);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Executes a raw query string against the Hyperion precompile.
     * @param _query The raw JSON query string.
     * @return result The result from the precompile.
     */
    function performRawQuery(string memory _query) public view returns (string memory) {
        string memory result = hyperion.query(_query);
        // Note: Events are not emitted from view functions.
        // A non-view wrapper would be needed to emit the result.
        return result;
    }

    /**
     * @notice Executes a structured query against a specific Hyperion endpoint.
     * @param _endpoint The target Hyperion API endpoint (e.g., "v2/history/get_actions").
     * @param _params The JSON-formatted parameters for the endpoint.
     */
    function performStructuredQuery(string memory _endpoint, string memory _params) public {
        string memory result = hyperion.queryJson(_endpoint, _params);
        emit HyperionResponse(result);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed.");
    }

    receive() external payable {}
}
