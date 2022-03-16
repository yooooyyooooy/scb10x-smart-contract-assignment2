//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Comptroller Methods
 */

interface IComptroller {
      /**
       * @notice Sender supplies assets into the market and receives cTokens in exchange
       * @dev Reverts upon any failure
       */
      function enterMarkets(address[] calldata) external returns (uint256[] memory);
}
