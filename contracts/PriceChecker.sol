//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 is ERC165 {
    /// @dev Prevent tokens being sent here.
    fallback() external payable {
        revert("403");
    }

    /// @dev Prevent tokens being sent here.
    receive() external payable {
        revert("403");
    }

    /// Return if this contract supports the requested functionality.
    /// @return bool
    function supportsInterface(bytes4 interfaceID)
        public
        pure
        override
        returns (bool)
    {
        return
            interfaceID == this.supportsInterface.selector ||
            interfaceID == this.getLatestPrice.selector;
    }

    /// Return the latest price data for a feed.
    /// @param feed The feed contract address to use.
    ///
    function getLatestPrice(address feed)
        public
        view
        returns (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        )
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feed);
        return priceFeed.latestRoundData();
    }
}
