// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HyperionQuery
 * @author Azrim
 * @notice This contract is designed to simulate interactions with a data
 * indexer like Hyperion. It allows for setting query types and parameters,
 * executing different kinds of queries, and emitting events with the results.
 * This is useful for testing on-chain interactions with off-chain data sources.
 */
contract HyperionQuery {
    address public owner;
    string public defaultQueryType;
    string public defaultQueryParam;

    // A mapping to store the results of queries.
    mapping(bytes32 => string) public queryResults;

    // Events to log query actions and results.
    event QueryPerformed(address indexed querier, string queryType, string queryParams);
    event ConfigurationChanged(string newDefaultType, string newDefaultParam);
    event AccountHistoryQueried(address indexed account, uint256 limit);
    event TransactionDetailsFetched(bytes32 indexed txHash);
    event LatestBlockQueried(string status);

    /**
     * @notice Sets the initial configuration upon deployment.
     * @param _defaultQueryType The default type of query to perform (e.g., "account_history").
     * @param _defaultQueryParam The default parameter for the query (e.g., an address or block number).
     */
    constructor(string memory _defaultQueryType, string memory _defaultQueryParam) {
        owner = msg.sender;
        defaultQueryType = _defaultQueryType;
        defaultQueryParam = _defaultQueryParam;
    }

    /**
     * @notice A generic function to perform a query with a given string.
     * @param _queryString The query to execute.
     */
    function performQuery(string memory _queryString) public {
        bytes32 queryId = keccak256(abi.encodePacked(block.timestamp, msg.sender, _queryString));
        string memory result = string(abi.encodePacked("Result for: ", _queryString));
        queryResults[queryId] = result;
        emit QueryPerformed(msg.sender, "generic", _queryString);
    }

    /**
     * @notice Fetches the latest block based on a status string.
     * @param _status The status to query, e.g., "finalized" or "pending".
     * @return blockNumber The simulated block number.
     */
    function getLatestBlock(string memory _status) public returns (uint256) {
        uint256 blockNumber = block.number;
        bytes32 queryId = keccak256(abi.encodePacked(blockNumber, _status));
        queryResults[queryId] = "Simulated latest block fetched.";
        emit LatestBlockQueried(_status);
        return blockNumber;
    }

    /**
     * @notice Simulates fetching the history for a specific account.
     * @param _account The address of the account to query.
     * @param _limit The maximum number of records to return.
     */
    function getAccountHistory(address _account, uint256 _limit) public {
        bytes32 queryId = keccak256(abi.encodePacked(_account, _limit));
        queryResults[queryId] = "Simulated history fetched for account.";
        emit AccountHistoryQueried(_account, _limit);
    }

    /**
     * @notice Simulates fetching details for a specific transaction hash.
     * @param _txHash The hash of the transaction to look up.
     */
    function getTransactionDetails(bytes32 _txHash) public view returns (string memory) {
        bytes32 queryId = keccak256(abi.encodePacked("tx_details", _txHash));
        // In a real contract, you might return stored data. Here we return a dynamic string.
        return queryResults[queryId];
    }
    
    /**
     * @notice Updates the default query configuration for the contract.
     * @param _newDefaultType The new default query type.
     * @param _newDefaultParam The new default query parameter.
     */
    function setConfiguration(string memory _newDefaultType, string memory _newDefaultParam) public {
        require(msg.sender == owner, "Only the owner can change the configuration.");
        defaultQueryType = _newDefaultType;
        defaultQueryParam = _newDefaultParam;
        emit ConfigurationChanged(_newDefaultType, _newDefaultParam);
    }
    
    // Modifier to restrict functions to the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @notice Allows the owner to withdraw any Ether sent to the contract.
     */
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed.");
    }

    // Allow the contract to receive Ether.
    receive() external payable {}
}
