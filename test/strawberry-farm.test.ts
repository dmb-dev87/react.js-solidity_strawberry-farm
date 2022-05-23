import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle"
import { Contract, BigNumber } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@openzeppelin/test-helpers";

chai.use(solidity)

describe("StrawberryFarm Contract", () => {

  let res: any;

  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let dave: SignerWithAddress;
  let eve: SignerWithAddress;

  let sbtFarm: Contract;
  let mockDai: Contract;
  let sbtToken: Contract;
  let buddhaNft: Contract;
  let lottery: Contract;

  const daiAmount: BigNumber = ethers.utils.parseEther("25000");
  const nftPrice: BigNumber = ethers.utils.parseEther("1")

  before(async () => {
    const SbtFarm = await ethers.getContractFactory("StrawberryFarm");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const SbtToken = await ethers.getContractFactory("StrawberryToken");
    const BuddhaNft = await ethers.getContractFactory("BuddhaNft");
    const Lottery = await ethers.getContractFactory("Lottery");

    [owner, alice, bob, carol, dave, eve] = await ethers.getSigners();

    mockDai = await MockERC20.deploy("MockDai", "mDAI")
    sbtToken = await SbtToken.deploy()
    buddhaNft = await BuddhaNft.deploy()

    const lottoConfig = [
      buddhaNft.address,
      sbtToken.address,
      "0xa36085F69e2889c224210F603D836748e7dC0088",
      "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9", // Coordinator
      "0xa36085F69e2889c224210F603D836748e7dC0088", // LINK address
      ethers.utils.parseEther(".1"), // VRF price
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4" // KeyHash
    ]

    lottery = await Lottery.deploy(...lottoConfig)

    await Promise.all([
      mockDai.mint(owner.address, daiAmount),
      mockDai.mint(alice.address, daiAmount),
      mockDai.mint(bob.address, daiAmount),
      mockDai.mint(carol.address, daiAmount),
      mockDai.mint(dave.address, daiAmount),
      mockDai.mint(eve.address, daiAmount)
    ])

    let sbtFarmParams: Array<string | BigNumber> = [
      mockDai.address,
      sbtToken.address,
      buddhaNft.address,
      lottery.address,
      nftPrice
    ]

    sbtFarm = await SbtFarm.deploy(...sbtFarmParams)
  })

  describe("Init", async () => {
    it("should deploy contracts", async () => {
      expect(sbtFarm).to.be.ok
      expect(sbtToken).to.be.ok
      expect(mockDai).to.be.ok
    })

    it("should return name", async () => {
      expect(await sbtFarm.name())
        .to.eq("SBT Farm")
      expect(await mockDai.name())
        .to.eq("MockDai")
      expect(await sbtToken.name())
        .to.eq("StrawberryToken")
    })

    it("should show mockDai balance", async () => {
      expect(await mockDai.balanceOf(owner.address))
        .to.eq(daiAmount)
    })

  })

  describe("Staking", async () => {
    it("should stake and update mapping", async () => {
      let toTransfer = ethers.utils.parseEther("100")
      await mockDai.connect(alice).approve(sbtFarm.address, toTransfer)

      expect(await sbtFarm.isStaking(alice.address))
        .to.eq(false)

      expect(await sbtFarm.connect(alice).stake(toTransfer))
        .to.be.ok

      expect(await sbtFarm.stakingBalance(alice.address))
        .to.eq(toTransfer)

      expect(await sbtFarm.isStaking(alice.address))
        .to.eq(true)
    })

    it("should remove dai from user", async () => {
      res = await mockDai.balanceOf(alice.address)
      expect(Number(res))
        .to.be.lessThan(Number(daiAmount))
    })

    it("should update balance with multiple stakes", async () => {
      let toTransfer = ethers.utils.parseEther("100")
      await mockDai.connect(eve).approve(sbtFarm.address, toTransfer)
      await sbtFarm.connect(eve).stake(toTransfer)

    })

    it("should revert stake with zero as staked amount", async () => {
      await expect(sbtFarm.connect(bob).stake(0))
        .to.be.revertedWith("You cannot stake zero tokens")
    })

    it("should revert stake without allowance", async () => {
      let toTransfer = ethers.utils.parseEther("50")
      await expect(sbtFarm.connect(bob).stake(toTransfer))
        .to.be.revertedWith("ERC20: insufficient allowance")
    })

    it("should revert with not enough funds", async () => {
      let toTransfer = ethers.utils.parseEther("1000000")
      await mockDai.approve(sbtFarm.address, toTransfer)

      await expect(sbtFarm.connect(bob).stake(toTransfer))
        .to.be.revertedWith("You cannot stake zero tokens")
    })
  })

  describe("Unstaking", async () => {
    it("should unstake balance from user", async () => {
      res = await sbtFarm.stakingBalance(alice.address)
      expect(Number(res))
        .to.be.greaterThan(0)

      let toTransfer = ethers.utils.parseEther("100")
      await sbtFarm.connect(alice).unstake(toTransfer)

      res = await sbtFarm.stakingBalance(alice.address)
      expect(Number(res))
        .to.eq(0)
    })

    it("should remove staking status", async () => {
      expect(await sbtFarm.isStaking(alice.address))
        .to.eq(false)
    })

    it("should transfer ownership", async () => {
      let minter = await sbtToken.MINTER_ROLE()
      await sbtToken.grantRole(minter, sbtFarm.address)

      expect(await sbtToken.hasRole(minter, sbtFarm.address))
        .to.eq(true)
    })
  })
})

describe("Start from deployment for time increase", () => {
  let res: any
  let expected: any

  let alice: SignerWithAddress
  let mockDai: Contract
  let sbtFarm: Contract
  let sbtToken: Contract
  let buddhaNft: Contract
  let lottery: Contract

  beforeEach(async () => {
    // Bare-boned initial deployment setup
    const SbtFarm = await ethers.getContractFactory("StrawberryFarm");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const SbtToken = await ethers.getContractFactory("StrawberryToken");
    const BuddhaNft = await ethers.getContractFactory("BuddhaNft");
    const Lottery = await ethers.getContractFactory("Lottery");
    [alice] = await ethers.getSigners();
    mockDai = await MockERC20.deploy("MockDai", "mDAI")
    sbtToken = await SbtToken.deploy()
    buddhaNft = await BuddhaNft.deploy()
    let lottoConfig = [
      buddhaNft.address,
      sbtToken.address,
      "0xa36085F69e2889c224210F603D836748e7dC0088",
      "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9", // Coordinator
      "0xa36085F69e2889c224210F603D836748e7dC0088", // LINK address
      ethers.utils.parseEther(".1"), // VRF price
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4" // KeyHash
    ]
    lottery = await Lottery.deploy(...lottoConfig)
    const daiAmount: BigNumber = ethers.utils.parseEther("25000");
    const nftPrice: BigNumber = ethers.utils.parseEther("1")
    await mockDai.mint(alice.address, daiAmount)
    sbtFarm = await SbtFarm.deploy(
      mockDai.address,
      sbtToken.address,
      buddhaNft.address,
      lottery.address,
      nftPrice
    )
    let minter = await sbtToken.MINTER_ROLE()
    await sbtToken.grantRole(minter, sbtFarm.address)

    let jackMinter = await buddhaNft.MINTER_ROLE()
    await buddhaNft.grantRole(jackMinter, sbtFarm.address)

    let toTransfer = ethers.utils.parseEther("10")
    await mockDai.approve(sbtFarm.address, toTransfer)
    await sbtFarm.stake(toTransfer)
  })

  describe("Yield", async () => {
    it("should return correct yield time", async () => {
      let timeStart = await sbtFarm.startTime(alice.address)
      expect(Number(timeStart))
        .to.be.greaterThan(0)

      // Fast-forward time
      await time.increase(86400)

      expect(await sbtFarm.calculateYieldTime(alice.address))
        .to.eq((86400))
    })

    it("should mint correct token amount in total supply and user", async () => {
      await time.increase(86400)

      let _time = await sbtFarm.calculateYieldTime(alice.address)
      let formatTime = _time / 86400
      let staked = await sbtFarm.stakingBalance(alice.address)
      let bal = staked * formatTime
      let newBal = ethers.utils.formatEther(bal.toString())
      expected = Number.parseFloat(newBal).toFixed(3)

      await sbtFarm.withdrawYield()

      res = await sbtToken.totalSupply()
      let newRes = ethers.utils.formatEther(res)
      let formatRes = Number.parseFloat(newRes).toFixed(3).toString()

      expect(expected)
        .to.eq(formatRes)

      res = await sbtToken.balanceOf(alice.address)
      newRes = ethers.utils.formatEther(res)
      formatRes = Number.parseFloat(newRes).toFixed(3).toString()

      expect(expected)
        .to.eq(formatRes)
    })

    it("should update yield balance when unstaked", async () => {
      await time.increase(86400)
      await sbtFarm.unstake(ethers.utils.parseEther("5"))

      res = await sbtFarm.sbtBalance(alice.address)
      expect(Number(ethers.utils.formatEther(res)))
        .to.be.approximately(10, .001)
    })

    /** BUG */
    it("should return correct yield when partially unstake", async () => {
      await time.increase(86400)
      await sbtFarm.unstake(ethers.utils.parseEther("5"))
      await time.increase(86400)
      await sbtFarm.withdrawYield()
      res = await sbtToken.balanceOf(alice.address)
      expect(Number(ethers.utils.formatEther(res)))
        .to.be.approximately(15, .001)
    })
  })

  describe("Multiple Stakes", async () => {
    it("should update yield balance after multiple stakes", async () => {
      time.increase(8640)

      let toTransfer = ethers.utils.parseEther("10")
      await mockDai.approve(sbtFarm.address, toTransfer)
      await sbtFarm.stake(toTransfer)

      res = await sbtFarm.sbtBalance(alice.address)
      let formatRes = ethers.utils.formatEther(res)

      expect(Number.parseFloat(formatRes).toFixed(3))
        .to.eq("1.000")
    })
  })

  describe("NFT", async () => {
    it("should mint an nft", async () => {
      time.increase(10000000)

      await sbtFarm.withdrawYield()

      let toTransfer = ethers.utils.parseEther("1")

      await sbtToken.approve(lottery.address, toTransfer)
      await sbtFarm.mintNFT(alice.address, "www")

      await sbtToken.approve(lottery.address, toTransfer)
      expect(await sbtFarm.mintNFT(alice.address, "www"))
        .to.emit(sbtFarm, "MintNFT")
        .withArgs(alice.address, 1)

      await sbtToken.approve(lottery.address, toTransfer)
      expect(await sbtFarm.mintNFT(alice.address, "www"))
        .to.emit(sbtFarm, "MintNFT")
        .withArgs(alice.address, 2)
    })

    it("should update nftCount", async () => {
      time.increase(1000000)

      await sbtFarm.withdrawYield()

      res = await sbtFarm.nftCount("www")
      expect(res).to.eq(0)

      let toTransfer = ethers.utils.parseEther("1")
      await sbtToken.approve(lottery.address, toTransfer)
      await sbtFarm.mintNFT(alice.address, "www")

      res = await sbtFarm.nftCount("www")
      expect(res).to.eq(1)
    })
  })

  describe("Events", async () => {
    it("should emit Stake", async () => {
      let toTransfer = ethers.utils.parseEther("10")
      await mockDai.approve(sbtFarm.address, toTransfer)

      await expect(sbtFarm.stake(toTransfer))
        .to.emit(sbtFarm, 'Stake')
        .withArgs(alice.address, toTransfer);
    })

    it("should emit Unstake", async () => {
      let toTransfer = ethers.utils.parseEther("10")
      await mockDai.approve(sbtFarm.address, toTransfer)
      await sbtFarm.stake(toTransfer)

      expect(await sbtFarm.unstake(toTransfer))
        .to.emit(sbtFarm, "Unstake")
        .withArgs(alice.address, toTransfer)
    })

    it("should emit YieldWithdraw", async () => {
      await time.increase(86400)

      let toTransfer = ethers.utils.parseEther("10")
      await sbtFarm.unstake(toTransfer)

      res = await sbtFarm.sbtBalance(alice.address)

      expect(await sbtFarm.withdrawYield())
        .to.emit(sbtFarm, "YieldWithdraw")
        .withArgs(alice.address, res)
    })

    it("should emit MintNFT event", async () => {
      await time.increase(86400)

      await sbtFarm.withdrawYield()

      let toTransfer = ethers.utils.parseEther("1")
      await sbtToken.approve(lottery.address, toTransfer)
      expect(await sbtFarm.mintNFT(alice.address, "www"))
        .to.emit(sbtFarm, "MintNFT")
        .withArgs(alice.address, 0)
    })
  })
})