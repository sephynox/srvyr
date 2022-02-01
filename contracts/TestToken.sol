//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract TestToken is
    ERC20 //, ERC165 {
{
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _supply);
    }

    // /// Return if this contract supports the requested functionality.
    // /// @return bool
    // function supportsInterface(bytes4 interfaceID)
    //     public
    //     pure
    //     override
    //     returns (bool)
    // {
    //     return
    //         interfaceID == this.supportsInterface.selector ||
    //         interfaceID ==
    //         ERC20.transfer.selector ^
    //             ERC20.transferFrom.selector ^
    //             ERC20.approve.selector ^
    //             ERC20.allowance.selector ^
    //             ERC20.totalSupply.selector ^
    //             ERC20.balanceOf.selector;
    // }
}
