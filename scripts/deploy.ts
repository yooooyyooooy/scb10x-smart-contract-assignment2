// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contract, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import KOVAN_NETWORK_CONSTANT from "../constants/kovan";

async function main() {
      // Hardhat always runs the compile task when running scripts with its command
      // line interface.
      //
      // If this script is run directly using `node` you may want to call compile
      // manually to make sure everything is compiled
      // await hre.run('compile');
      // We get the contract to deploy
      const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as string, ethers.provider);

      const {
            CETHER_ADDRESS,
            CDAI_ADDRESS,
            DAI_ADDRESS,
            WETH_ADDRESS,
            COMPTROLLER_ADDRESS,
            SWAP_ROUTER_ADDRESS,
            ETHUSD_PRICEFEED_ADDRESS,
            DAIUSD_PRICEFEED_ADDRESS,
      } = KOVAN_NETWORK_CONSTANT;

      const Factory = await ethers.getContractFactory("Factory");
      const ETHLeverage = await ethers.getContractFactory("ETHLeverage");

      const factory = await Factory.connect(deployer).deploy();
      await factory.deployed();
      console.log("Factory contract deployed at address:", factory.address);

      const saltHex = ethers.utils.solidityKeccak256(["string"], ["scb10x"]);
      const abiCoder = new ethers.utils.AbiCoder();
      const encodedParams = abiCoder
            .encode(
                  ["address", "address", "address", "address", "address", "address", "address", "address", "address"],
                  [
                        deployer.address,
                        CETHER_ADDRESS,
                        CDAI_ADDRESS,
                        DAI_ADDRESS,
                        WETH_ADDRESS,
                        COMPTROLLER_ADDRESS,
                        SWAP_ROUTER_ADDRESS,
                        ETHUSD_PRICEFEED_ADDRESS,
                        DAIUSD_PRICEFEED_ADDRESS,
                  ],
            )
            .slice(2);
      const constructorByteCode = `${ETHLeverage.bytecode}${encodedParams}`;
      const ethLeverageAddress = await factory.computeAddressWithDeployer(
            saltHex,
            ethers.utils.solidityKeccak256(["bytes"], [constructorByteCode]),
            factory.address,
      );
      console.log("ETHLeverage contract should be deployed at address:", ethLeverageAddress);
      const deployTransaction: ContractTransaction = await factory
            .connect(deployer)
            .deploy(0, saltHex, constructorByteCode);
      const receipt: ContractReceipt = await deployTransaction.wait();
      const eventData = receipt.events?.find((events) => events.event == "DeployedAddress");
      console.log("ETHLeverage deployed at address:", eventData?.args?._deployedAddress);
      await factory.connect(deployer).setAddressRecord(deployer.address, eventData?.args?._deployedAddress);

      const ethLeverage = await ethers.getContractAt(
            "ETHLeverage",
            await factory.connect(deployer).getUserETHLeverageAddress(deployer.address),
      );
      console.log(
            "User's ETHLeverage contract address",
            await factory.connect(deployer).getUserETHLeverageAddress(deployer.address),
      );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
});
