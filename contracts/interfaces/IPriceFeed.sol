//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Pricefeed Methods (UniswapAnchoredView)
 */

interface IPriceFeed {
      /**
       * @notice Get the official price for a symbol
       * @param symbol The symbol to fetch the price of
       * @return Price denominated in USD, with 6 decimals
       */
      function price(string memory symbol) external view returns (uint256);

      /**
       * @notice Get the underlying price of a cToken asset
       * @param cToken The cToken to get the underlying price of
       * @return The underlying asset price mantissa (scaled by 1e18).
       *  Zero means the price is unavailable.
       */
      function getUnderlyingPrice(address cToken) external view returns (uint256);
}
