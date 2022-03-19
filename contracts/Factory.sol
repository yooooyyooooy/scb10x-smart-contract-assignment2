// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Factory is Pausable, Ownable {
      event DeployedAddress(address _deployedAddress);
      mapping(address => address) public addressRecord;

      /**
       * @notice Set ETHLeverage Address for each address
       * @param _userAddress user's address
       * @param _ETHLeverageAddress ETHLeverageAddress that acquired after `deploy` method
       */
      function setAddressRecord(address _userAddress, address _ETHLeverageAddress) public onlyOwner {
            addressRecord[_userAddress] = _ETHLeverageAddress;
      }

      /**
       * @notice Get ETHLeverage Address of the user's address
       * @return ETHLeverage address of the user
       */
      function getUserETHLeverageAddress(address _userAddress) public view returns (address) {
            return addressRecord[_userAddress];
      }

      /**
       * @dev Deploys a contract using `CREATE2`. The address where the
       * contract will be deployed can be known in advance via {computeAddress}.
       *
       * The bytecode for a contract can be obtained from Solidity with
       * `type(contractName).creationCode`.
       *
       * Requirements:
       * - `bytecode` must not be empty.
       * - `salt` must have not been used for `bytecode` already.
       * - the factory must have a balance of at least `value`.
       * - if `value` is non-zero, `bytecode` must have a `payable` constructor.
       */
      function deploy(
            uint256 value,
            bytes32 salt,
            bytes memory code
      ) public whenNotPaused {
            address deployedAddress = Create2.deploy(value, salt, code);
            emit DeployedAddress(deployedAddress);
      }

      /**
       * @dev Returns the address where a contract will be stored if deployed via {deploy} from a
       * contract located at `deployer`. If `deployer` is this contract's address, returns the
       * same value as {computeAddress}.
       */
      function computeAddressWithDeployer(
            bytes32 salt,
            bytes32 codeHash,
            address deployer
      ) public pure returns (address) {
            return Create2.computeAddress(salt, codeHash, deployer);
      }
}
