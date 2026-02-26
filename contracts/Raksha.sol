// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Raksha {

    event EmergencyLogged(
        address indexed user,
        uint256 timestamp,
        string latitude,
        string longitude
    );

    function logEmergency(
        string memory latitude,
        string memory longitude
    ) public {

        emit EmergencyLogged(
            msg.sender,
            block.timestamp,
            latitude,
            longitude
        );
    }
}