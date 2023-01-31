// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@matterlabs/zksync-contracts/l1/contracts/zksync/interfaces/IZkSync.sol";
import "@matterlabs/zksync-contracts/l1/contracts/common/libraries/UnsafeBytes.sol";

contract L1Contract {
    string private greeting;
    address private l2Contract;

    event CallResult(bool indexed success, uint32 indexed blockNumber, bytes message);

    modifier onlySelf() {
      require(msg.sender == address(this));
      _;
    }

    constructor(address _l2Contract) {
      l2Contract = _l2Contract;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) onlySelf public {
        greeting = _greeting;
    }

    // NOTE: The zkSync contract implements only the functionality for proving that a message belongs to a block
    // but does not guarantee that such a proof was used only once. That's why a contract that uses L2 -> L1
    // communication must take care of the double handling of the message.
    /// @dev mapping L2 block number => message number => flag
    /// @dev Used to indicated that zkSync L2 -> L1 message was already processed
    mapping(uint32 => mapping(uint256 => bool)) isL2ToL1MessageProcessed;

    function consumeMessageFromL2(
      // The address of the zkSync smart contract.
      // It is not recommended to hardcode it during the alpha testnet as regenesis may happen.
      // This can be retrieved with zksync-web3 zkSyncProvider.getMainContractAddress()
      address _zkSyncAddress,
      // zkSync block number in which the message was sent
      uint32 _blockNumber,
      // The position in the L2 logs Merkle tree of the l2Log that was sent with the message, that can be received via API
      uint256 _index,
      // Message index, that can be received via API
      uint16 _txNumberInBlock,
      // The sender address of the message
      address _sender,
      // The message that was sent from l2
      bytes calldata _message,
      // Merkle proof for inclusion of L2 log that was sent with the message
      bytes32[] calldata _proof
    ) external returns (bytes32 messageHash) {
      // check that the message has not been processed yet
      require(!isL2ToL1MessageProcessed[_blockNumber][_index]);
      require(_sender == l2Contract);

      (uint32 functionSignature,) = UnsafeBytes.readUint32(_message, 0);
      require(bytes4(functionSignature) == this.setGreeting.selector);

      IZkSync zksync = IZkSync(_zkSyncAddress);

      bool success = zksync.proveL2MessageInclusion(
        _blockNumber,
        _index,
        // Information about the sent message: sender address, the message itself, tx index in the L2 block where the message was sent
        L2Message({sender: _sender, data: _message, txNumberInBlock: _txNumberInBlock}),
        _proof
      );

      require(success, "Failed to prove message inclusion");
      (bool callSuccess,) = address(this).call(_message);
      emit CallResult(callSuccess, _blockNumber, _message);

      // Mark message as processed
      isL2ToL1MessageProcessed[_blockNumber][_index] = true;
    }
}
