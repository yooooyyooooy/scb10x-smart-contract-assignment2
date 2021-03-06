import * as dotenv from "dotenv";
import { config as dotenvConfig } from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
      const accounts = await hre.ethers.getSigners();

      for (const account of accounts) {
            console.log(account.address);
      }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
      solidity: "0.8.4",
      defaultNetwork: "hardhat",
      networks: {
            hardhat: {
                  forking: {
                        url: process.env.KOVAN_NODE ?? "",
                  },
            },
            kovan: {
                  url: process.env.KOVAN_NODE as string,
            },
      },
      gasReporter: {
            enabled: process.env.REPORT_GAS !== undefined,
            currency: "USD",
      },
      etherscan: {
            apiKey: process.env.ETHERSCAN_API_KEY!!,
      },
      mocha: {
            timeout: 300000,
      },
};

export default config;
