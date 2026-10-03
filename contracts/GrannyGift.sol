// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GrannyGift {
    address public granny;
    uint256 public giftAmount;
    mapping(address => uint256) public birthdays;
    mapping(address => bool) public withdrawn;

    event GiftWithdrawn(address indexed grandchild, uint256 amount);

    constructor(address[] memory _grandchildren, uint256[] memory _birthdays) payable {
        require(_grandchildren.length > 0, "No grandchildren");
        require(_grandchildren.length == _birthdays.length, "Length mismatch");
        require(msg.value > 0, "No deposit");

        granny = msg.sender;
        giftAmount = msg.value / _grandchildren.length;

        for (uint256 i = 0; i < _grandchildren.length; i++) {
            birthdays[_grandchildren[i]] = _birthdays[i];
        }
    }

    function withdraw() external {
        require(birthdays[msg.sender] != 0, "Not a grandchild");
        require(block.timestamp >= birthdays[msg.sender], "Too early");
        require(!withdrawn[msg.sender], "Already withdrawn");

        withdrawn[msg.sender] = true;
        payable(msg.sender).transfer(giftAmount);

        emit GiftWithdrawn(msg.sender, giftAmount);
    }
}