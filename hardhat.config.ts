import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { HardhatNetworkAccountsUserConfig } from "hardhat/types/config";
import { utils } from "ethers";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@typechain/ethers-v5";
import "@symfoni/hardhat-react";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const accounts: HardhatNetworkAccountsUserConfig = [
  {
    privateKey: process.env.GOVERNOR_PRIVATE_KEY || "",
    balance: utils.parseEther("2000000").toString(),
  },
  {
    privateKey: process.env.TEST_PRIVATE_KEY || "",
    balance: utils.parseEther("2000000").toString(),
  },
];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: accounts,
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
