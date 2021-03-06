import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import KOVAN_NETWORK_CONSTANT from "../constants/kovan";

/**
 * @file Unit testing for ETHLeverge.sol
 * @author Ratchanon Wattanataweekul
 */

describe("ETHLeverage Contract Test", function () {
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
      let ethLeverage: Contract,
            cEtherToken: Contract,
            daiToken: Contract,
            wethToken: Contract,
            uniswapRouter: Contract;
      let owner: SignerWithAddress, user: SignerWithAddress, unrelatedUser: SignerWithAddress;

      before(async function () {
            [owner, user, unrelatedUser] = await ethers.getSigners();

            cEtherToken = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  CETHER_ADDRESS,
            );
            daiToken = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI_ADDRESS);
            wethToken = await ethers.getContractAt("IWETH", WETH_ADDRESS);

            uniswapRouter = await ethers.getContractAt(
                  "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol:ISwapRouter",
                  SWAP_ROUTER_ADDRESS,
            );

            ETHLeverage = await ethers.getContractFactory("ETHLeverage");
            ethLeverage = await ETHLeverage.connect(user).deploy(
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
            it("Should NOT let the user open their leverage position correctly if the contract is not related to them", async function () {
                  await expect(
                        ethLeverage.connect(unrelatedUser).openPosition(130 * 1000, {
                              value: ethers.utils.parseEther("4"),
                        }),
                  ).to.be.revertedWith("Incorrect Address");
            });
            it("Should let the user open their leverage position correctly", async function () {
                  await expect(() =>
                        ethLeverage.connect(user).openPosition(130 * 1000, {
                              value: ethers.utils.parseEther("4"),
                        }),
                  ).to.changeEtherBalance(user, ethers.utils.parseEther("-2.8"));
            });
      });
      describe("Querying Position", function () {
            it("Should NOT let the user open their leverage position correctly if the contract is not related to them", async function () {
                  await expect(ethLeverage.connect(unrelatedUser).queryPosition()).to.be.revertedWith(
                        "Incorrect Address",
                  );
            });
            it("Should let the user query their leverage position correctly", async function () {
                  const results = await ethLeverage.connect(user).callStatic.queryPosition();
                  expect(parseInt(results.leverageLevel)).to.equal(30000);
            });
      });
      describe("Close Position", function () {
            it("Should NOT let the user close their leverage position correctly if the contract is not related to them", async function () {
                  await expect(ethLeverage.connect(unrelatedUser).closePosition()).to.be.revertedWith(
                        "Incorrect Address",
                  );
            });
            it("Should NOT let the user close their leverage position correctly if they have insufficient DAI", async function () {
                  await daiToken.connect(user).transfer(owner.address, daiToken.balanceOf(user.address));
                  await expect(ethLeverage.connect(user).closePosition()).to.be.revertedWith(
                        "Insufficient amount of DAI in the wallet",
                  );
            });

            it("Should let the user close their leverage position correctly if they have sufficient DAI", async function () {
                  await expect(() =>
                        wethToken.connect(user).deposit({
                              value: ethers.utils.parseEther("5"),
                        }),
                  ).to.changeTokenBalance(wethToken, user, ethers.utils.parseEther("5"));

                  await wethToken.connect(user).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther("5"));
                  const blockNumBefore = await ethers.provider.getBlockNumber();
                  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
                  const timestampBefore = blockBefore.timestamp;
                  await uniswapRouter.connect(user).exactInputSingle({
                        tokenIn: WETH_ADDRESS,
                        tokenOut: DAI_ADDRESS,
                        fee: 3000,
                        recipient: user.address,
                        deadline: timestampBefore + 120,
                        amountIn: ethers.utils.parseEther("5"),
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0,
                  });

                  await daiToken
                        .connect(user)
                        .approve(
                              ethLeverage.address,
                              ethers.BigNumber.from(
                                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                              ),
                        );
                  const beforeClosingPositionETHBalance = await user.getBalance();
                  await ethLeverage.connect(user).closePosition();
                  const afterClosingPositionETHBalance = await user.getBalance();

                  expect(
                        parseFloat(
                              ethers.utils.formatEther(
                                    afterClosingPositionETHBalance.sub(beforeClosingPositionETHBalance),
                              ),
                        ),
                  ).to.greaterThan(3.99);
                  expect(
                        parseFloat(
                              ethers.utils.formatEther(
                                    afterClosingPositionETHBalance.sub(beforeClosingPositionETHBalance),
                              ),
                        ),
                  ).to.lessThan(4);
            });
      });
      describe("Reopen Position", function () {
            it("Should NOT let the user open their leverage position correctly if the contract is not related to them", async function () {
                  await expect(
                        ethLeverage.connect(unrelatedUser).openPosition(130 * 1000, {
                              value: ethers.utils.parseEther("5"),
                        }),
                  ).to.be.revertedWith("Incorrect Address");
            });
            it("Should let the user open their leverage position again correctly", async function () {
                  await expect(() =>
                        ethLeverage.connect(user).openPosition(130 * 1000, {
                              value: ethers.utils.parseEther("5"),
                        }),
                  ).to.changeEtherBalance(user, ethers.utils.parseEther("-3.5"));
            });
      });
      describe("Reclose Position", function () {
            it("Should let the user close their leverage position correctly if they have sufficient DAI", async function () {
                  await expect(() =>
                        wethToken.connect(user).deposit({
                              value: ethers.utils.parseEther("10"),
                        }),
                  ).to.changeTokenBalance(wethToken, user, ethers.utils.parseEther("10"));

                  await wethToken.connect(user).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther("10"));
                  const blockNumBefore = await ethers.provider.getBlockNumber();
                  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
                  const timestampBefore = blockBefore.timestamp;
                  await uniswapRouter.connect(user).exactInputSingle({
                        tokenIn: WETH_ADDRESS,
                        tokenOut: DAI_ADDRESS,
                        fee: 3000,
                        recipient: user.address,
                        deadline: timestampBefore + 120,
                        amountIn: ethers.utils.parseEther("10"),
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0,
                  });

                  await daiToken
                        .connect(user)
                        .approve(
                              ethLeverage.address,
                              ethers.BigNumber.from(
                                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                              ),
                        );
                  const beforeClosingPositionETHBalance = await user.getBalance();
                  await ethLeverage.connect(user).closePosition();
                  const afterClosingPositionETHBalance = await user.getBalance();

                  expect(
                        parseFloat(
                              ethers.utils.formatEther(
                                    afterClosingPositionETHBalance.sub(beforeClosingPositionETHBalance),
                              ),
                        ),
                  ).to.greaterThan(4.99);
                  expect(
                        parseFloat(
                              ethers.utils.formatEther(
                                    afterClosingPositionETHBalance.sub(beforeClosingPositionETHBalance),
                              ),
                        ),
                  ).to.lessThan(5);
            });
      });
});
