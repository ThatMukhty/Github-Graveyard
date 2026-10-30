// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemorialNFT is ERC721URIStorage, Ownable {
    uint256 private nextTokenId = 1;

    event MemorialMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string metadataURI
    );

    constructor()
        ERC721("GitHub Graveyard Memorials", "GRAVE")
        Ownable(msg.sender)
    {}

    /**
     * @notice Mint a permanent digital memorial.
     * @param metadataURI IPFS URI containing the memorial metadata.
     *
     * Anyone can mint.
     * The caller receives the NFT.
     * No additional mint fee is charged by this contract.
     */
    function mintMemorial(
        string calldata metadataURI
    ) external returns (uint256) {
        require(
            bytes(metadataURI).length > 0,
            "Metadata URI required"
        );

        uint256 tokenId = nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit MemorialMinted(
            msg.sender,
            tokenId,
            metadataURI
        );

        return tokenId;
    }

    /**
     * @notice Returns the next available token ID.
     */
    function nextAvailableTokenId()
        external
        view
        returns (uint256)
    {
        return nextTokenId;
    }
}