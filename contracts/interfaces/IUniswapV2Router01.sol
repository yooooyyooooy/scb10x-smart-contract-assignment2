//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UniswapV2 Router methods
 */

interface IUniswapV2Router01 {
      /**
       * @dev Swap ERC20 tokens to exact amount of ETH
       * @param amountOut The amount of ETH preferred
       * @param amountInMax The maximum amount of ERC20 token
       * @param path Path of the tokens
       * @param to Destination Address
       * @param deadline Deadline of the transaction
       * @return amounts the amount array id the tokens in the "path" param
       */
      function swapTokensForExactETH(
            uint256 amountOut,
            uint256 amountInMax,
            address[] calldata path,
            address to,
            uint256 deadline
      ) external returns (uint256[] memory amounts);

      /**
       * @dev function that returns address of WETH
       */
      function WETH() external pure returns (address);
}
