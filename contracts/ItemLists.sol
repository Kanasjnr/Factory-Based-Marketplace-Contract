// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

contract ItemLists {
    address public owner;

    struct Item {
        uint256 id;
        string name;
        uint256 price;
        bool isAvailable;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    event ItemListed(uint256 indexed id, string name, uint256 price);
    event ItemSold(uint256 indexed id, string name, uint256 price);

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function listItem(string memory _name, uint256 _price) public onlyOwner {
        uint256 newItemId = itemCount;
        items[newItemId] = Item(newItemId, _name, _price, true);
        emit ItemListed(newItemId, _name, _price);
        itemCount++;
    }

    function markItemAsSold(uint256 _id) public onlyOwner {
        require(items[_id].isAvailable, "Item is not available");
        items[_id].isAvailable = false;
        emit ItemSold(_id, items[_id].name, items[_id].price);
    }

    function getItem(
        uint256 _id
    ) public view returns (uint256, string memory, uint256, bool) {
        Item memory item = items[_id];
        return (item.id, item.name, item.price, item.isAvailable);
    }
}