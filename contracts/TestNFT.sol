//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        mintUniqueTokenTo(msg.sender, 1234);
    }

    function mintUniqueTokenTo(address _to, uint256 _tokenId) public {
        super._mint(_to, _tokenId);
    }
}
