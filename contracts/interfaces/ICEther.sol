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

      /**
       * @notice Get the token balance of the `owner`
       * @param owner The address of the account to query
       * @return balance The number of tokens owned by `owner`
       */
      function balanceOf(address owner) external view returns (uint256 balance);

      /**
       * @notice Sender redeems cTokens in exchange for the underlying asset
       * @dev Accrues interest whether or not the operation succeeds, unless reverted
       * @param redeemTokens The number of cTokens to redeem into underlying
       * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
       */
      function redeem(uint256 redeemTokens) external returns (uint256);

      /**
       * @notice Get the underlying balance of the `owner`
       * @dev This also accrues interest in a transaction
       * @param owner The address of the account to query
       * @return The amount of underlying owned by `owner`
       */
      function balanceOfUnderlying(address owner) external returns (uint256);
}
