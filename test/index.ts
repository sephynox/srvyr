import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { MockProvider } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers, waffle } from "hardhat";

describe("BalanceChecker", function () {
  const TEST_TOKEN_BALANCE = 1000000;
  const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
  const CHAINLINK_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

  let balanceChecker: Contract;
  let testToken: Contract;
  let testNFT: Contract;
  let provider: MockProvider;
  let accounts: SignerWithAddress[];

  before(async function () {
    const BalanceChecker = await ethers.getContractFactory("BalanceChecker");
    const TestToken = await ethers.getContractFactory("TestToken");
    const TestNFT = await ethers.getContractFactory("TestNFT");

    provider = waffle.provider;
    balanceChecker = await BalanceChecker.deploy();
    testToken = await TestToken.deploy("TestToken", "TST", TEST_TOKEN_BALANCE);
    testNFT = await TestNFT.deploy("TestNFT", "TNT");
    accounts = await ethers.getSigners();
  });

  beforeEach(async function () {
    await balanceChecker.deployed();
    await testToken.deployed();
    await testNFT.deployed();
  });

  it("Should check the ether balance", async () => {
    const balance = await provider.getBalance(accounts[0].address);
    const balances = await balanceChecker.tokenBalances([accounts[0].address, accounts[1].address], [ETHER_ADDRESS]);

    expect(balances[0]).to.be.ok;
    expect(balances[0]).to.equal(balance);
  });

  it("Should check the test tokens balances", async () => {
    const tokenBalance = await testToken.balanceOf(accounts[0].address);
    const balance = await balanceChecker.tokenBalance(accounts[0].address, testToken.address);
    const balances = await balanceChecker.tokenBalances([accounts[0].address], [testToken.address, testNFT.address]);

    expect(balances[0]).to.be.ok;
    expect(tokenBalance).to.equal(TEST_TOKEN_BALANCE);
    expect(balance).to.equal(TEST_TOKEN_BALANCE);
    expect(balances[0]).to.equal(TEST_TOKEN_BALANCE);
    expect(balances[1]).to.equal(1);
  });

  it("Should check the test NFT balance", async () => {
    const tokenBalance = await testNFT.balanceOf(accounts[0].address);
    const balance = await balanceChecker.tokenBalance(accounts[0].address, testNFT.address);

    expect(tokenBalance).to.equal(1);
    expect(balance).to.equal(1);
  });

  it("Should return no balance for a non-contract address", async () => {
    const balances = await balanceChecker.tokenBalances([accounts[0].address], [accounts[0].address]);
    expect(balances[0].isZero()).to.be.ok;
  });

  it("Should return no balance for an unsupported contract", async () => {
    const balances = await balanceChecker.tokenBalances([accounts[0].address], [balanceChecker.address]);
    expect(balances[0].isZero()).to.be.ok;
  });

  it("Should return a price feed for a specified feed", async () => {
    const [roundID, price, startedAt, timeStamp, answeredInRound] = await balanceChecker.getLatestPrice(CHAINLINK_FEED);

    expect(roundID).to.not.be.empty;
    expect(price).to.not.be.empty;
    expect(startedAt).to.not.be.empty;
    expect(timeStamp).to.not.be.empty;
    expect(answeredInRound).to.not.be.empty;
  });
});
