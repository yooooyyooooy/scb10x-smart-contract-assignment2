//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CERC20 methods
 */

interface ICERC20 {
      /**
       * @notice Sender borrows assets from the protocol to their own address
       * @param borrowAmount The amount of the underlying asset to borrow
       * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
       */
      function borrow(uint256 borrowAmount) external returns (uint256);

      /**
       * @notice Sender repays their own borrow
       * @param repayAmount The amount to repay
       * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
       */
      function repayBorrow(uint256 repayAmount) external returns (uint256);
}
