//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract BalanceChecker is ERC165 {
    fallback() external payable {
        revert("403");
    }

    function supportsInterface(bytes4 interfaceID)
        public
        pure
        override
        returns (bool)
    {
        return
            interfaceID == this.supportsInterface.selector ||
            interfaceID == this.tokenBalance.selector ^ this.balances.selector;
    }

    function tokenBalance(address user, address token)
        public
        view
        returns (uint256)
    {
        if (Address.isContract(token) && _checkSupport(token)) {
            return IERC20(token).balanceOf(user);
        } else {
            return 0;
        }
    }

    function balances(address[] memory users, address[] memory tokens)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory addrBalances = new uint256[](
            tokens.length * users.length
        );

        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < tokens.length; j++) {
                uint256 addrIdx = j + tokens.length * i;
                if (tokens[j] != address(0x0)) {
                    addrBalances[addrIdx] = tokenBalance(users[i], tokens[j]);
                } else {
                    addrBalances[addrIdx] = users[i].balance;
                }
            }
        }

        return addrBalances;
    }

    function _checkSupport(address contractAddress)
        private
        view
        returns (bool)
    {
        return
            ERC165Checker.supportsInterface(
                contractAddress,
                type(IERC20).interfaceId ^
                    type(IERC721).interfaceId ^
                    type(IERC1155).interfaceId
            );
    }
}
