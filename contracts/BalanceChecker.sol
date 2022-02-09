//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title A simple balance checker for standardized assets.
/// @author Tanveer Wahid
/// @notice Based on a similar contract by @wbobeirne
contract BalanceChecker is ERC165 {
    /// Default support
    bytes4[] public defaultInterfaces = [
        type(IERC20).interfaceId,
        type(IERC721).interfaceId,
        type(IERC1155).interfaceId
    ];

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
            interfaceID ==
            this.getLatestPrice.selector ^
                this.getLatestPrices.selector ^
                this.tokenBalance.selector ^
                this.tokenBalances.selector ^
                this.tokenBalanceWithInterfaces.selector ^
                this.tokenBalancesWithInterfaces.selector;
    }

    /// Return the balance of a specified token for an account.
    /// @param user The address of the token holder
    /// @param token The address of the token contract
    /// @return uint256 of the balance
    function tokenBalance(address user, address token)
        public
        view
        returns (uint256)
    {
        return _tokenBalance(user, token, defaultInterfaces);
    }

    /// Return the balance of a specified token for an account including
    /// an additional interface check for contract types via ERC165.
    /// @param user The address of the token holder
    /// @param token The address of the token contract
    /// @param interfaceID The interface to check for.
    /// @return uint256 of the balance
    function tokenBalanceWithInterfaces(
        address user,
        address token,
        bytes4[] memory interfaceID
    ) public view returns (uint256) {
        return _tokenBalance(user, token, interfaceID);
    }

    /// Return the balance of a specified token for an account.
    /// @param users The addresses of the token holders
    /// @param tokens the addresses of the token contracts
    /// @return uint256[] of the balances
    function tokenBalances(address[] memory users, address[] memory tokens)
        external
        view
        returns (uint256[] memory)
    {
        return _balances(users, tokens, defaultInterfaces);
    }

    /// Return the balance of a specified token for an account including
    /// an additional interface check for contract types via ERC165.
    /// @param users The addresses of the token holders
    /// @param tokens the addresses of the token contracts
    /// @param interfaceID Pass 0xffffffff to use the default ERC20/721/1155
    /// @return uint256[] of the balances
    function tokenBalancesWithInterfaces(
        address[] memory users,
        address[] memory tokens,
        bytes4[] memory interfaceID
    ) external view returns (uint256[] memory) {
        return _balances(users, tokens, interfaceID);
    }

    /// Return the latest price data for a feed.
    /// @param feedAddress The feed contract address to use.
    function getLatestPrice(address feedAddress)
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
        AggregatorV3Interface priceFeed = AggregatorV3Interface(feedAddress);
        return priceFeed.latestRoundData();
    }

    /// Return the latest price data for a feed.
    /// @param feedAddresses The feed contract address to use.
    function getLatestPrices(address[] memory feedAddresses)
        public
        view
        returns (int256[] memory)
    {
        int256[] memory contractPrices = new int256[](feedAddresses.length);

        for (uint256 i = 0; i < feedAddresses.length; i++) {
            AggregatorV3Interface priceFeed = AggregatorV3Interface(
                feedAddresses[i]
            );

            try priceFeed.latestRoundData() returns (
                uint80, /* roundID */
                int256 price,
                uint256, /* startedAt */
                uint256 timeStamp,
                uint80 /* answeredInRound */
            ) {
                if (timeStamp != 0) {
                    contractPrices[i] = price;
                } else {
                    contractPrices[i] = 0;
                }
            } catch {
                contractPrices[i] = 0;
            }
        }

        return contractPrices;
    }

    // TODO We will need to query the roundId and store it.
    // /// Return the historical price data for a feed.
    // /// @param feedAddress The feed contract address to use.
    // function getHsitoricalPrices(address feedAddress)
    //     public
    //     view
    //     returns (int256[] memory)
    // {

    // }

    function _balances(
        address[] memory users,
        address[] memory tokens,
        bytes4[] memory interfaces
    ) private view returns (uint256[] memory) {
        uint256[] memory addrBalances = new uint256[](
            tokens.length * users.length
        );

        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < tokens.length; j++) {
                uint256 addrIdx = j + tokens.length * i;
                if (tokens[j] != address(0x0)) {
                    addrBalances[addrIdx] = _tokenBalance(
                        users[i],
                        tokens[j],
                        interfaces
                    );
                } else {
                    addrBalances[addrIdx] = users[i].balance;
                }
            }
        }

        return addrBalances;
    }

    function _tokenBalance(
        address user,
        address token,
        bytes4[] memory interfaces
    ) private view returns (uint256) {
        if (Address.isContract(token) && _checkSupport(token, interfaces)) {
            return IERC20(token).balanceOf(user);
        } else {
            return 0;
        }
    }

    function _checkSupport(address contractAddress, bytes4[] memory interfaces)
        private
        view
        returns (bool)
    {
        bool result = false;

        for (uint256 i = 0; i < interfaces.length; i++) {
            result = ERC165Checker.supportsInterface(
                contractAddress,
                interfaces[i]
            );

            if (result) {
                break;
            } else if (interfaces[i] == type(IERC20).interfaceId) {
                // Test pre-EIP165 ERC20 tokens
                try IERC20(contractAddress).balanceOf(msg.sender) returns (
                    uint256
                ) {
                    return true;
                } catch (bytes memory) {
                    continue;
                }
            }
        }

        return result;
    }
}
