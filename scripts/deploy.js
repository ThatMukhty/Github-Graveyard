const hre = require("hardhat");

async function main() {
  console.log("Deploying GitHub Graveyard Memorial NFT...");

  const MemorialNFT = await hre.ethers.getContractFactory("MemorialNFT");
  const memorialNFT = await MemorialNFT.deploy();

  await memorialNFT.waitForDeployment();

  const contractAddress = await memorialNFT.getAddress();

  console.log("Memorial NFT deployed successfully.");
  console.log("Contract address:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});