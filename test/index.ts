import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { MockProvider } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers, waffle } from "hardhat";

describe("BalanceChecker", function () {
  let balanceChecker: Contract;
  let testToken: Contract;
  let provider: MockProvider;
  let accounts: SignerWithAddress[];

  before(async function () {
    const BalanceChecker = await ethers.getContractFactory("BalanceChecker");
    const TestToken = await ethers.getContractFactory("TestToken");

    provider = waffle.provider;
    balanceChecker = await BalanceChecker.deploy();
    testToken = await TestToken.deploy();
    accounts = await ethers.getSigners();
  });

  beforeEach(async function () {
    await balanceChecker.deployed();
    await testToken.deployed();
  });

  it("Should check the ether balance", async () => {
    const balance = await provider.getBalance(accounts[0].address);
    const balances = await balanceChecker.balances.call([accounts[0], accounts[1].address], ["0x0"]);

    expect(balances[0]).to.be.ok(`Balance: ${balances[0]}`);
    expect(balance.toString()).to.equal(provider.getBalance(accounts[0].address).toString());
  });

  it("Should check the test token balance", async () => {
    const tokenBalance = await testToken.getBalance(accounts[0].address);
    const balances = await balanceChecker.balances.call([accounts[0].address], [testToken.address]);

    expect(balances[0]).to.be.ok(`Balance: ${balances[0]}`);
    expect(tokenBalance.toString()).to.equal(provider.getBalance(accounts[0].address).toString());
  });

  it("Should return no balance for a non-contract address", async () => {
    const tokenBalance = await testToken.getBalance(accounts[0].address);
    const balances = await balanceChecker.balances.call([accounts[0].address], [accounts[0].address]);

    expect(balances[0].isZero()).to.be.ok("Balance is Zero");
  });

  it("Should return no balance for an unsupported contract", async () => {
    const tokenBalance = await testToken.getBalance(accounts[0].address);
    const balances = await balanceChecker.balances.call([accounts[0].address], [balanceChecker.address]);

    expect(balances[0].isZero()).to.be.ok("Balance is Zero");
  });
});
