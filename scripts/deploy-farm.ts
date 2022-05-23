import { ethers } from "hardhat";
import { mainConfig, lottoConfig } from "./config";

// const nftPrice = ethers.utils.parseEther("1")

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying contracts with ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`)

  const SbtToken = await ethers.getContractFactory("StrawberryToken")
  const sbtToken = await SbtToken.deploy()
  console.log(`SbtToken address: ${sbtToken.address}`)

  const SbtFarm = await ethers.getContractFactory("StrawberryFarm");
  const sbtFarm = await SbtFarm.deploy(
    ...mainConfig, sbtToken.address
    //...mainConfig, pmknToken.address, jackOLantern.address, nftPrice
    // mockDai.address, pmknToken.address, jackOLantern.address, nftPrice
  )
  console.log(`SbtFarm address: ${sbtFarm.address}`)
  // console.log(`NFT Price: ${ethers.utils.formatEther(nftPrice)} PMKN`)

  const sbtMinter = await sbtToken.MINTER_ROLE()
  await sbtToken.grantRole(sbtMinter, sbtFarm.address)
  console.log(`SBTToken minter role transferred to: ${sbtFarm.address}`)

  // const jackMinter = await jackOLantern.MINTER_ROLE()
  // await jackOLantern.grantRole(jackMinter, pmknFarm.address)
  // console.log(`Jack-O-Lantern NFT minter role transferred to ${pmknFarm.address}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error)
    process.exit(1)
  })