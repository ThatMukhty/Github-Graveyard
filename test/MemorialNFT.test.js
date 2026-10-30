const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemorialNFT", function () {
  async function deployContract() {
    const [owner, anotherUser] = await ethers.getSigners();

    const MemorialNFT = await ethers.getContractFactory("MemorialNFT");
    const contract = await MemorialNFT.deploy();

    await contract.waitForDeployment();

    return { contract, owner, anotherUser };
  }

  it("should deploy with the correct name and symbol", async function () {
    const { contract } = await deployContract();

    expect(await contract.name()).to.equal(
      "GitHub Graveyard Memorials"
    );

    expect(await contract.symbol()).to.equal("GRAVE");
  });

  it("should mint a memorial NFT", async function () {
    const { contract, owner } = await deployContract();

    const metadataURI = "ipfs://example-metadata";

    await expect(contract.mintMemorial(metadataURI))
      .to.emit(contract, "MemorialMinted")
      .withArgs(owner.address, 1, metadataURI);

    expect(await contract.ownerOf(1)).to.equal(owner.address);
    expect(await contract.tokenURI(1)).to.equal(metadataURI);
  });

  it("should reject an empty metadata URI", async function () {
    const { contract } = await deployContract();

    await expect(
      contract.mintMemorial("")
    ).to.be.revertedWith("Metadata URI required");
  });

  it("should give each NFT a unique token ID", async function () {
    const { contract, owner, anotherUser } = await deployContract();

    await contract.mintMemorial("ipfs://first-memorial");

    await contract.connect(anotherUser).mintMemorial(
      "ipfs://second-memorial"
    );

    expect(await contract.ownerOf(1)).to.equal(owner.address);
    expect(await contract.ownerOf(2)).to.equal(anotherUser.address);
    expect(await contract.nextAvailableTokenId()).to.equal(3);
  });
});