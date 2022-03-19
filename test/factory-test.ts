import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory, ContractReceipt, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import KOVAN_NETWORK_CONSTANT from "../constants/kovan";

/**
 * @file Unit testing for Factory.sol
 * @author Ratchanon Wattanataweekul
 */

describe("Factory Contract Test", function () {
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

      let Factory: ContractFactory, ETHLeverage: ContractFactory;
      let factory: Contract, ethLeverage: Contract;
      let owner: SignerWithAddress, user: SignerWithAddress;

      const saltHex = ethers.utils.solidityKeccak256(["string"], ["scb10x"]);
      const abiCoder = new ethers.utils.AbiCoder();

      let encodedParams: string;
      let constructorByteCode: string;

      before(async function () {
            [owner, user] = await ethers.getSigners();

            Factory = await ethers.getContractFactory("Factory");
            factory = await Factory.connect(owner).deploy();
            await factory.deployed();

            ETHLeverage = await ethers.getContractFactory("ETHLeverage");

            encodedParams = abiCoder
                  .encode(
                        [
                              "address",
                              "address",
                              "address",
                              "address",
                              "address",
                              "address",
                              "address",
                              "address",
                              "address",
                        ],
                        [
                              user.address,
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
            constructorByteCode = `${ETHLeverage.bytecode}${encodedParams}`;
      });

      describe("Create ethLeverage from factory", function () {
            it("Should let each user create their own ethLeverage contract from Factory", async function () {
                  const ethLeverageAddress = await factory.computeAddressWithDeployer(
                        saltHex,
                        ethers.utils.solidityKeccak256(["bytes"], [constructorByteCode]),
                        factory.address,
                  );
                  const deployTransaction: ContractTransaction = await factory
                        .connect(user)
                        .deploy(0, saltHex, constructorByteCode);
                  const receipt: ContractReceipt = await deployTransaction.wait();
                  const eventData = receipt.events?.find((events) => events.event == "DeployedAddress");
                  expect(ethLeverageAddress).to.equal(eventData?.args?._deployedAddress);

                  ethLeverage = await ethers.getContractAt("ETHLeverage", eventData?.args?._deployedAddress);

                  await expect(() =>
                        ethLeverage.connect(user).openPosition(150 * 1000, {
                              value: ethers.utils.parseEther("4"),
                        }),
                  ).to.changeEtherBalance(user, ethers.utils.parseEther("-2"));
            });
      });
});
