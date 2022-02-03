// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const BalanceChecker = await ethers.getContractFactory("BalanceChecker");
  // const TestToken = await ethers.getContractFactory("TestToken");
  // const TestNFT = await ethers.getContractFactory("TestNFT");

  const balanceChecker = await BalanceChecker.deploy();
  // const testToken = await TestToken.deploy("TestToken", "TST", 100000);
  // const testNFT = await TestNFT.deploy("TestNFT", "TNT");

  await balanceChecker.deployed();
  // await testToken.deployed();
  // await testNFT.deployed();

  console.log("BalanceChecker deployed to:", balanceChecker.address);
  // console.log("TestToken deployed to:", testToken.address);
  // console.log("TestNFT deployed to:", testNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
