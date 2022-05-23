import { ethers } from "hardhat";
import { mainConfig, lottoConfig } from "./config";

const nftPrice = ethers.utils.parseEther("1")

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying contracts with ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`)

  const SbtToken = await ethers.getContractFactory("StrawberryToken")
  const sbtToken = await SbtToken.deploy()
  console.log(`SbtToken address: ${sbtToken.address}`)

  const BuddhaNft = await ethers.getContractFactory("BuddhaNft")
  const buddhaNft = await BuddhaNft.deploy()
  console.log(`BuddhaNft address: ${buddhaNft.address}`)

  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(buddhaNft.address, sbtToken.address, ...lottoConfig);
  console.log(`Lottery contract address: ${lottery.address}`);

  const SbtFarm = await ethers.getContractFactory("StrawberryFarm");
  const sbtFarm = await SbtFarm.deploy(
    ...mainConfig, sbtToken.address, buddhaNft.address, lottery.address, nftPrice
  )

  console.log(`SbtFarm address: ${sbtFarm.address}`)
  console.log(`NFT Price: ${ethers.utils.formatEther(nftPrice)} SBT`)

  const sbtMinter = await sbtToken.MINTER_ROLE()
  await sbtToken.grantRole(sbtMinter, sbtFarm.address)
  console.log(`SBTToken minter role transferred to: ${sbtFarm.address}`)

  const buddhaMinter = await buddhaNft.MINTER_ROLE()
  await buddhaNft.grantRole(buddhaMinter, sbtFarm.address)
  console.log(`Buddha NFT minter role transferred to ${sbtFarm.address}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error)
    process.exit(1)
  })