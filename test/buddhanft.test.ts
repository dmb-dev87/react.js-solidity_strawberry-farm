import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { Contract } from "ethers";
import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity)

describe("BuddhatNft Contract", () => {

  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  let buddhaNft: Contract;

  beforeEach(async () => {
    const BuddhaNft = await ethers.getContractFactory("BuddhaNft");
    [owner, alice, bob] = await ethers.getSigners();
    buddhaNft = await BuddhaNft.deploy()
    let minter = await buddhaNft.MINTER_ROLE()
    await buddhaNft.grantRole(minter, owner.address)
  })

  describe("Init", async () => {
    it("should deploy", async () => {
      expect(buddhaNft)
        .to.be.ok
    })

    it("has a name", async () => {
      expect(await buddhaNft.name())
        .to.eq("Buddha-NFT")
    })

    it("tracks tokens", async () => {
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.safeMint(owner.address)

      expect(await buddhaNft.getTotalSupply())
        .to.eq(2)
    })

    it("should enumerate", async () => {
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.safeMint(owner.address)
      await buddhaNft.transferFrom(owner.address, alice.address, 4)
      let res = await buddhaNft.tokenOfOwnerByIndex(alice.address, 0)
      expect(res).to.eq(4)
      res = await buddhaNft.balanceOf(alice.address)
      expect(res).to.eq(1)
      res = await buddhaNft.balanceOf(owner.address)
      expect(res).to.eq(4)
    })
  })
})