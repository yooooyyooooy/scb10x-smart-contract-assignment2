//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CEther methods
 * @dev All the methods are based on CEther.sol on Kovan Testnet (0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72)
 */

interface ICEther {
      /**
       * @notice Sender supplies assets into the market and receives cTokens in exchange
       * @dev Reverts upon any failure
       */
      function mint() external payable;
}
