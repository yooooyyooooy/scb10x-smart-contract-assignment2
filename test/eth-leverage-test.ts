import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import KOVAN_NETWORK_CONSTANT from "../constants/kovan";
/**
 * @file Unit testing for ETHLeverge.sol
 * @author Ratchanon Wattanataweekul
 */

describe.only("ETHLeverage Contract Test", function () {
      const { CETHER_ADDRESS } = KOVAN_NETWORK_CONSTANT;
      let ETHLeverage: ContractFactory;
      let ethLeverage: Contract, cEtherToken: Contract;
      let owner: SignerWithAddress, user: SignerWithAddress;
      console.log(CETHER_ADDRESS);

      beforeEach(async function () {
            [owner, user] = await ethers.getSigners();

            cEtherToken = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  CETHER_ADDRESS,
            );

            ETHLeverage = await ethers.getContractFactory("ETHLeverage");
            ethLeverage = await ETHLeverage.connect(owner).deploy(user.address, CETHER_ADDRESS);
            await ethLeverage.deployed();
      });

      describe("Open Position", function () {
            it("Should let the user open their leverage position correctly", async function () {
                  // console.log(await owner.getBalance());
                  console.log(await user.getBalance());
                  console.log(await cEtherToken.balanceOf(ethLeverage.address));
                  // console.log(await owner.getAddress());
                  await ethLeverage.connect(user).openPosition(
                        {
                              value: ethers.utils.parseEther("0.01"),
                        },
                        // ethers.utils.parseEther("0.0001"),
                  );
                  console.log(await user.getBalance());
                  console.log(await cEtherToken.balanceOf(ethLeverage.address));
            });
            // console.log(owner.getBalance());
            // console.log((await owner.getAddress()));
      });
});
