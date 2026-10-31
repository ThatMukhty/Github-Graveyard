// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GitHubTombstone is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    mapping(string => bool) public mintedRepos;

    event TombstoneMinted(address indexed owner, uint256 indexed tokenId, string repoName, string tokenURI);

    constructor() ERC721("GitHub Tombstone", "DEAD") Ownable(msg.sender) {}

    function mintTombstone(string memory repoId, string memory metadataURI) public returns (uint256) {
        require(!mintedRepos[repoId], "Tombstone already minted for this repository");
        
        uint256 tokenId = _nextTokenId++;
        mintedRepos[repoId] = true;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit TombstoneMinted(msg.sender, tokenId, repoId, metadataURI);
        return tokenId;
    }
}