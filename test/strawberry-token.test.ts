import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("StrawberryToken Contract", () => {

  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  let sbtToken: Contract;
  let differentContract: Contract;

  before(async () => {
    const SbtToken = await ethers.getContractFactory("StrawberryToken");
    const DifferentContract = await ethers.getContractFactory("StrawberryToken");

    [owner, alice, bob] = await ethers.getSigners();

    sbtToken = await SbtToken.deploy()
    differentContract = await DifferentContract.deploy()
  })

  describe("Init", async () => {
    it("should deploy", async () => {
      expect(sbtToken)
        .to.be.ok
    })

    it("has a name", async () => {
      expect(await sbtToken.name())
        .to.eq("StrawberryToken")
    })

    it("should have no supply after deployment", async () => {
      expect(await sbtToken.totalSupply())
        .to.eq(0)
    })
  })

  describe("Test minter role", async () => {
    it("should confirm deployer as owner", async () => {
      let minter = await sbtToken.MINTER_ROLE()
      await sbtToken.grantRole(minter, owner.address)
      expect(await sbtToken.hasRole(minter, owner.address))
        .to.eq(true)
    })

    it("should mint tokens from owner", async () => {
      // Sanity check
      expect(await sbtToken.balanceOf(owner.address))
        .to.eq(0)

      await sbtToken.mint(owner.address, 50)

      expect(await sbtToken.totalSupply())
        .to.eq(50)

      expect(await sbtToken.balanceOf(owner.address))
        .to.eq(50)
    })

    it("should revert mint from non-minter", async () => {
      await expect(sbtToken.connect(alice).mint(alice.address, 20))
        .to.be.reverted
    })

    it("should revert transfer from non-admin", async () => {
      let minter = await sbtToken.MINTER_ROLE()
      await expect(sbtToken.connect(alice).grantRole(minter, alice.address))
        .to.be.reverted
    })
  })
})