//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICEther.sol";
import "hardhat/console.sol";

/**
 * @title ETH Leverage Positioning
 * @author Ratchanon Wattanataweekul
 * @notice A contract that perform ETH Leverage Postioning according to SCB10X Assignment requirements
 */

contract ETHLeverage {
      using SafeERC20 for IERC20;
      address private userAddress;
      ICEther private cEther;

      /**
       * @notice Construct a new ETHLeverage contract
       * @param _userAddress The address of the user
       * @param _cEtherAddress The address of the cEther token
       */
      constructor(address _userAddress, address _cEtherAddress) {
            userAddress = _userAddress;
            cEther = ICEther(_cEtherAddress);
      }

      /**
       * @notice Open leverage position of the user
       * @param _leverageRatio The leverage Ratio that the user preferred
       */
      function openPosition(uint256 _leverageRatio) public payable {
            cEther.mint{value: msg.value}();
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
