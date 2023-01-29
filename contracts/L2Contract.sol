// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

contract L2Contract {
    event MessageSent(bytes32 indexed messageHash, address indexed l1Messenger, bytes message);

    function sendGreetingMessageToL1(string memory greeting) external returns(bytes32 messageHash) {
        bytes memory message = abi.encodeWithSignature(
            "setGreeting(string)",
            greeting
        );

        messageHash = L1_MESSENGER_CONTRACT.sendToL1(message);
        emit MessageSent(messageHash, address(L1_MESSENGER_CONTRACT), message);
    }
}
