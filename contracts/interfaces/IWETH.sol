//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title WETH methods
 */

interface IWETH is IERC20 {
      /**
       * @notice Unwrap WETH to ETH
       * @param wad WETH Amount
       */
      function withdraw(uint256 wad) external;

      /**
       * @notice Wrap ETH to WETH
       * @dev Specify the amount via msg.value
       */
      function deposit() external payable;
}
