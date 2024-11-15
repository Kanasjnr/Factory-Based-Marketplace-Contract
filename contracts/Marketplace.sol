// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;
import "./ItemLists.sol";

contract Marketplace {
    struct User {
        bool isRegistered;
        address listingContract;
    }

    mapping(address => User) public users;
    address[] public userAddresses;

    
    event UserRegistered(address indexed userAddress);
    event ListingCreated(address indexed userAddress, address indexed listingAddress);

    function registerUser() public {
        require(msg.sender != address(0), "Zero address is not allowed");
        require(!users[msg.sender].isRegistered, "User is already registered");
        

        users[msg.sender].isRegistered = true;
        userAddresses.push(msg.sender);

        
        emit UserRegistered(msg.sender);
    }

    function createListing() public {
        require(users[msg.sender].isRegistered, "User is not registered");
         require(msg.sender != address(0), "Zero address is not allowed");

        ItemLists newListing = new ItemLists(msg.sender);
        users[msg.sender].listingContract = address(newListing);

        
        emit ListingCreated(msg.sender, address(newListing));
    }

    function getUserListing(address userAddress) public view returns (address) {
        require(users[userAddress].isRegistered, "User is not registered");
        return users[userAddress].listingContract;
    }

    function getAllUsers() public view returns (address[] memory) {
        return userAddresses;
    }
}