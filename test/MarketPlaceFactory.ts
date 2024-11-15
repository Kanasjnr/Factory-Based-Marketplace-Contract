import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

describe("Marketplace_Contract", function () {
  async function deployContractsFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const ItemLists = await ethers.getContractFactory("ItemLists");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();

    return { marketplace, ItemLists, owner, user1, user2 };
  }

  describe("Deployment", () => {
    it("Should deploy the Marketplace contract correctly", async function () {
      const { marketplace } = await loadFixture(deployContractsFixture);
      expect(await marketplace.getAddress()).to.be.properAddress;
    });
  });

  describe("User Registration", () => {
    it("Should register a new user", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);

      await expect(marketplace.connect(user1).registerUser()).to.not.be
        .reverted;

      const user = await marketplace.users(user1.address);
      expect(user.isRegistered).to.be.true;
    });

    it("Should not allow registering an already registered user", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);

      await marketplace.connect(user1).registerUser();

      await expect(
        marketplace.connect(user1).registerUser()
      ).to.be.revertedWith("User is already registered");
    });
  });

  describe("Listing Creation", () => {
    it("Should create a new listing for a registered user", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);

      await marketplace.connect(user1).registerUser();
      await expect(marketplace.connect(user1).createListing()).to.not.be
        .reverted;

      const listingAddress = await marketplace.getUserListing(user1.address);
      expect(listingAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should not allow creating a listing for an unregistered user", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);

      await expect(
        marketplace.connect(user1).createListing()
      ).to.be.revertedWith("User is not registered");
    });
  });

  describe("Get User Listing", () => {
    it("Should return the correct listing address for a user", async () => {
      const { marketplace, ItemLists, user1 } = await loadFixture(
        deployContractsFixture
      );

      await marketplace.connect(user1).registerUser();
      await marketplace.connect(user1).createListing();

      const listingAddress = await marketplace.getUserListing(user1.address);
      const listing = await ItemLists.attach(listingAddress);

      expect(await listing.owner()).to.equal(user1.address);
    });

    it("Should revert for an unregistered user", async () => {
      const { marketplace, user1 } = await loadFixture(deployContractsFixture);

      await expect(
        marketplace.getUserListing(user1.address)
      ).to.be.revertedWith("User is not registered");
    });
  });

  describe("Get All Users", () => {
    it("Should return all registered users", async () => {
      const { marketplace, user1, user2 } = await loadFixture(
        deployContractsFixture
      );

      await marketplace.connect(user1).registerUser();
      await marketplace.connect(user2).registerUser();

      const users = await marketplace.getAllUsers();
      expect(users).to.have.lengthOf(2);
      expect(users).to.include(user1.address);
      expect(users).to.include(user2.address);
    });

    it("Should return an empty array when no users are registered", async () => {
      const { marketplace } = await loadFixture(deployContractsFixture);

      const users = await marketplace.getAllUsers();
      expect(users).to.have.lengthOf(0);
    });

    
 
    describe("Integration with ItemLists", () => {
        it("Should allow listing an item through the created ItemLists contract", async () => {
          const { marketplace, ItemLists, user1 } = await loadFixture(deployContractsFixture);
      
          await marketplace.connect(user1).registerUser();
          await marketplace.connect(user1).createListing();
      
          const listingAddress = await marketplace.getUserListing(user1.address);
          const listing = await ItemLists.attach(listingAddress);
      
          const itemName = "Tv";
          const itemPrice = ethers.parseEther("1");
      
          await expect(listing.connect(user1).listItem(itemName, itemPrice))
            .to.emit(listing, "ItemListed")
            .withArgs(0, itemName, itemPrice);
      
          const [id, name, price, isAvailable] = await listing.getItem(0);
          expect(id).to.equal(0);
          expect(name).to.equal(itemName);
          expect(price).to.equal(itemPrice);
          expect(isAvailable).to.be.true;
      
          
          await listing.connect(user1).listItem("Macbook", ethers.parseEther("0.5"));
          await listing.connect(user1).listItem("Hp Laptop", ethers.parseEther("0.75"));
      
          expect(await listing.itemCount()).to.equal(3);
      
          const [id2, name2, price2, isAvailable2] = await listing.getItem(2);
          expect(id2).to.equal(2);
          expect(name2).to.equal("Hp Laptop");
          expect(price2).to.equal(ethers.parseEther("0.75"));
          expect(isAvailable2).to.be.true;
        });
      });
})
  })

