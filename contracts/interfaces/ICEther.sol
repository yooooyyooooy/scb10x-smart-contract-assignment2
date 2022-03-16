//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CEther methods
 */

interface ICEther {
      /**
       * @notice Sender supplies assets into the market and receives cTokens in exchange
       * @dev Reverts upon any failure
       */
      function mint() external payable;
}
