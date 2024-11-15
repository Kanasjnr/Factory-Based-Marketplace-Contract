import { ethers } from "hardhat";
import { Marketplace, ItemLists } from "../typechain-types";

async function main() {
  


  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  console.log("Marketplace deployed to:", await marketplace.getAddress());

 
  const [deployer, user1] = await ethers.getSigners();

  console.log("Registering user1...");
 
  await marketplace.connect(user1).registerUser();

  console.log("Creating listing for user1...");
 
  await marketplace.connect(user1).createListing();

  
  const listingAddress = await marketplace.getUserListing(user1.address);
  console.log("Listing created at:", listingAddress);

 
  const ItemLists = await ethers.getContractFactory("ItemLists");
  const itemList = ItemLists.attach(listingAddress) as ItemLists;

  console.log("Listing an item...");
  
  const itemName = "Laptop";
  const itemPrice = ethers.parseEther("0.1");
  await itemList.connect(user1).listItem(itemName, itemPrice);

  console.log("Getting item details...");
 
  const [id, name, price, isAvailable] = await itemList.getItem(0);

  console.log("Item details:");
  console.log("ID:", id.toString());
  console.log("Name:", name);
  console.log("Price:", ethers.formatEther(price), "ETH");
  console.log("Is Available:", isAvailable);

 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



































