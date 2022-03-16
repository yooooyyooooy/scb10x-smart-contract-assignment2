//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./interfaces/ICEther.sol";
import "./interfaces/ICERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IComptroller.sol";
import "./interfaces/IPriceFeed.sol";
import "hardhat/console.sol";

/**
 * @title ETH Leverage Positioning
 * @author Ratchanon Wattanataweekul
 * @notice A contract that performs ETH Leverage Postioning according to SCB10X Assignment requirements
 */

contract ETHLeverage {
      using SafeERC20 for IERC20;

      uint256 private hundredPercent = 100 * 1000;
      uint256 private marginError = 5 * 1000;

      address private userAddress;
      ICEther internal cEther;
      ICERC20 internal cDAI;
      IERC20 internal DAI;
      IWETH internal WETH;
      IComptroller internal comptroller;
      ISwapRouter internal swapRouter;
      AggregatorV3Interface internal ethUsdPriceFeed;
      AggregatorV3Interface internal daiUsdPriceFeed;

      /**
       * @notice Construct a new ETHLeverage contract
       * @param _userAddress The address of the user
       * @param _cEtherAddress The address of the cEther token
       * @param _cDaiAddress The address of the cDAI token
       * @param _daiAddress The address of the DAI token
       * @param _WETHAddress The address of the WETH token
       * @param _comptrollerAddress The address of the comptroller
       * @param _swapRouterAddress The address of uniswapv2 based router
       * @param _ethUsdPriceFeedAddress The address of the pricefeed (Chainlink Oracle: ETH/USD)
       * @param _daiUsdPriceFeedAddress The address of the pricefeed (Chainlink Oracle: DAI/USD)
       */
      constructor(
            address _userAddress,
            address _cEtherAddress,
            address _cDaiAddress,
            address _daiAddress,
            address _WETHAddress,
            address _comptrollerAddress,
            address _swapRouterAddress,
            address _ethUsdPriceFeedAddress,
            address _daiUsdPriceFeedAddress
      ) {
            userAddress = _userAddress;
            cEther = ICEther(_cEtherAddress);
            cDAI = ICERC20(_cDaiAddress);
            DAI = IERC20(_daiAddress);
            WETH = IWETH(_WETHAddress);
            comptroller = IComptroller(_comptrollerAddress);
            swapRouter = ISwapRouter(_swapRouterAddress);
            ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeedAddress);
            daiUsdPriceFeed = AggregatorV3Interface(_daiUsdPriceFeedAddress);
      }

      /**
       * @notice TransferETH from the contract to user
       * @param to receipient's address
       * @param value ETH value in wei
       */
      function safeTransferETH(address to, uint256 value) internal {
            (bool success, ) = to.call{value: value}(new bytes(0));
            require(success, "ETH transfer failed");
      }

      /**
       * @notice Open leverage position of the user
       * @param _leverageRatio The leverage Ratio that the user preferred
       */
      function openPosition(uint256 _leverageRatio) public payable {
            /**
             * @notice Mint cEther
             */
            cEther.mint{value: msg.value}();

            /**
             * @notice Enter the market via a comptroller by using ETH as collateral
             * @dev Returns 0 if succeed, else if failed
             */
            address[] memory cETHAdress = new address[](1);
            cETHAdress[0] = address(cEther);
            uint256[] memory errors = comptroller.enterMarkets(cETHAdress);
            require(errors[0] == 0, "Cannot enter the market.");

            /**
             * @notice Get ETH/USD Rates fron chainlink oracles
             * @return ETH/USD Rates with 8 decimal units
             */
            (, int256 ethUsdPrice, , , ) = ethUsdPriceFeed.latestRoundData();

            /**
             * @notice Get DAI/USD Rates fron chainlink oracles
             * @return DAI/USD Rates with 8 decimal units
             */
            (, int256 daiUsdPrice, , , ) = daiUsdPriceFeed.latestRoundData();

            /**
             * @notice Calculate ETH/DAI Rates
             */
            uint256 ethDaiRate = uint256(ethUsdPrice) / uint256(daiUsdPrice);
            console.log("Rate: %s", ethDaiRate);

            /**
             * @notice Borrow DAI based on the user's leveragae ratio
             * @dev "status" value should be 0, otherwise an error occured
             */
            uint256 daiBorrowAmountInWei = (msg.value * (_leverageRatio + marginError - hundredPercent) * ethDaiRate) /
                  hundredPercent;
            uint256 status = cDAI.borrow(daiBorrowAmountInWei);
            console.log("Borrowed : %s", daiBorrowAmountInWei / 10**18);
            require(status == 0, "Failed to borrow DAI");

            /**
             * @notice Approve DAI token to swaprouter and swap the borrowed DAI to WETH
             */
            DAI.safeApprove(address(swapRouter), daiBorrowAmountInWei);

            ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
                  tokenIn: address(DAI),
                  tokenOut: address(WETH),
                  fee: 3000,
                  recipient: address(this),
                  deadline: block.timestamp,
                  amountOut: (msg.value * (_leverageRatio - hundredPercent)) / hundredPercent,
                  amountInMaximum: daiBorrowAmountInWei,
                  sqrtPriceLimitX96: 0
            });
            swapRouter.exactOutputSingle(params);

            /**
             * @notice Unwrap WETH and transfer extra ETH to user
             */
            WETH.withdraw(WETH.balanceOf(address(this)));
            safeTransferETH(userAddress, address(this).balance);

            /**
             * @notice Repay the remaining dai to compound if there are any dai left
             */
            if (DAI.balanceOf(address(this)) > 0) {
                  DAI.safeApprove(address(cDAI), DAI.balanceOf(address(this)));
                  uint256 repayStatus = cDAI.repayBorrow(DAI.balanceOf(address(this)));
                  require(repayStatus == 0, "Failed to repay DAI.");
            }
      }

      /**
       * @dev Function to receive Ether. msg.data must be empty
       */
      receive() external payable {}

      /**
       * @dev Fallback function is called when msg.data is not empty
       */
      fallback() external payable {}
}
