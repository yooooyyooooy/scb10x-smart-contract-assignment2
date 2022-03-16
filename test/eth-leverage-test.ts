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

      let ETHLeverage: ContractFactory;
      let ethLeverage: Contract, cEtherToken: Contract, daiToken: Contract;
      let owner: SignerWithAddress, user: SignerWithAddress;

      beforeEach(async function () {
            [owner, user] = await ethers.getSigners();

            cEtherToken = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  CETHER_ADDRESS,
            );
            daiToken = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI_ADDRESS);

            ETHLeverage = await ethers.getContractFactory("ETHLeverage");
            ethLeverage = await ETHLeverage.connect(owner).deploy(
                  user.address,
                  CETHER_ADDRESS,
                  CDAI_ADDRESS,
                  DAI_ADDRESS,
                  WETH_ADDRESS,
                  COMPTROLLER_ADDRESS,
                  SWAP_ROUTER_ADDRESS,
                  ETHUSD_PRICEFEED_ADDRESS,
                  DAIUSD_PRICEFEED_ADDRESS,
            );
            await ethLeverage.deployed();
      });

      describe("Open Position", function () {
            it("Should let the user open their leverage position correctly", async function () {
                  await expect(() =>
                        ethLeverage.connect(user).openPosition(150 * 1000, {
                              value: ethers.utils.parseEther("4"),
                        }),
                  ).to.changeEtherBalance(user, ethers.utils.parseEther("-2"));
            });
      });
});
