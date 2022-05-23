import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { ethers } from "ethers"

import SbtFarm from "./abis/StrawberryFarm.json"
import SbtToken from "./abis/StrawberryToken.json"
import BuddhaNft from "./abis/BuddhaNft.json"
import Lottery from "./abis/Lottery.json"
import ERC20 from "./abis/ERC20.json"

import { UserProvider } from "./context/UserContext"
import { ContractProvider } from "./context/ContractContext"

import Main from "./components/Main";

const Container = styled.div`
    width: 100%;
    height: 75rem;
`;

function App() {

    const [userAddress, setUserAddress] = useState("")
    const [ethBalance, setEthBalance] = useState("")
    const [daiBalance, setDaiBalance] = useState("")
    const [sbtBalance, setSbtBalance] = useState("")
    const [stakingBalance, setStakingBalance] = useState("")
    const [sbtYield, setSbtYield] = useState("")
    const [sbtUnrealizedYield, setSbtUnrealizedYield] = useState("")
    const [userNFTs, setUserNFTs] = useState("")

    const userState = {
        userAddress,
        setUserAddress,
        ethBalance,
        setEthBalance,
        daiBalance,
        setDaiBalance,
        sbtBalance,
        setSbtBalance,
        stakingBalance,
        setStakingBalance,
        sbtYield,
        setSbtYield,
        sbtUnrealizedYield,
        setSbtUnrealizedYield,
        userNFTs,
        setUserNFTs,
    }

    const [init, setInit] = useState(false)
    const [networkId, setNetworkId] = useState("")
    const [provider, setProvider] = useState({})
    const [daiContract, setDaiContract] = useState({})
    const [linkContract, setLinkContract] = useState({})
    const [sbtTokenContract, setSbtTokenContract] = useState({})
    const [sbtFarmContract, setSbtFarmContract] = useState({})
    const [buddhaContract, setBuddhaContract] = useState({})
    const [lotteryContract, setLotteryContract] = useState({})
    const [isLotteryOpen, setIsLotteryOpen] = useState(false)
    const [isNFTOpen, setIsNFTOpen] = useState(false)
    const [isOwnerOpen, setIsOwnerOpen] = useState(false)
    const [lotteryBalance, setLotteryBalance] = useState("")
    const [linkBalance, setLinkBalance] = useState("")
    const [lotteryCount, setLotteryCount] = useState("")
    const [owner, setOwner] = useState("")
    const [winningNumber, setWinningNumber] = useState("")

    const contractState = {
        init,
        setInit,
        networkId,
        setNetworkId,
        provider,
        setProvider,
        daiContract,
        setDaiContract,
        linkContract,
        setLinkContract,
        sbtTokenContract,
        setSbtTokenContract,
        sbtFarmContract,
        setSbtFarmContract,
        buddhaContract,
        setBuddhaContract,
        lotteryContract,
        setLotteryContract,
        isLotteryOpen,
        setIsLotteryOpen,
        isNFTOpen,
        setIsNFTOpen,
        isOwnerOpen,
        setIsOwnerOpen,
        lotteryBalance,
        setLotteryBalance,
        linkBalance,
        setLinkBalance,
        lotteryCount,
        setLotteryCount,
        owner,
        setOwner,
        winningNumber,
        setWinningNumber,
    }

    const loadProvider = useCallback(async () => {
        let prov = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(prov)
        return prov
    }, [setProvider])

    const loadDaiContract = useCallback(async (_provider) => {
        let daiAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
        let contract = new ethers.Contract(daiAddress, ERC20.abi, _provider)
        setDaiContract(contract)
    }, [setDaiContract])

    const loadLinkContract = useCallback(async (_provider) => {
        let linkAddress = "0xa36085F69e2889c224210F603D836748e7dC0088"
        let contract = new ethers.Contract(linkAddress, ERC20.abi, _provider)
        setLinkContract(contract)
    }, [setLinkContract])

    const loadSbtToken = useCallback(async (_provider) => {
        let sbtTokenAddress = SbtToken["networks"]["42"]["address"]
        let contract = new ethers.Contract(sbtTokenAddress, SbtToken.abi, _provider)
        setSbtTokenContract(contract)
    }, [setSbtTokenContract])

    const loadSbtFarmContract = useCallback(async (_provider) => {
        let sbtFarmAddress = SbtFarm["networks"]["42"]["address"]
        let contract = new ethers.Contract(sbtFarmAddress, SbtFarm.abi, _provider)
        setSbtFarmContract(contract)
    }, [setSbtFarmContract])

    const loadBuddhaContract = useCallback(async (_provider) => {
        let buddhaContractAddress = BuddhaNft["networks"]["42"]["address"]
        let contract = new ethers.Contract(buddhaContractAddress, BuddhaNft.abi, _provider)
        setBuddhaContract(contract)
    }, [setBuddhaContract])

    const loadLotteryContract = useCallback(async (_provider) => {
        let lotteryContractAddress = Lottery["networks"]["42"]["address"]
        console.log("Lottery: ", lotteryContractAddress)
        let contract = new ethers.Contract(lotteryContractAddress, Lottery.abi, _provider)
        setLotteryContract(contract)
    }, [setLotteryContract])

    const componentDidMount = useCallback(async () => {
        await loadProvider().then(async (res) => {
            await loadDaiContract(res)
            await loadLinkContract(res)
            await loadSbtToken(res)
            await loadSbtFarmContract(res)
            await loadBuddhaContract(res)
            await loadLotteryContract(res)
        })
        setInit(true)
    }, [
        loadProvider,
        loadDaiContract,
        loadLinkContract,
        loadSbtToken,
        loadSbtFarmContract,
        loadBuddhaContract,
        loadLotteryContract,
        setInit
    ])

    useEffect(() => {
        try {
            if (init === false) {
                componentDidMount()
            }
        } catch (error) {
            console.log(error)
        }
    }, [componentDidMount, daiContract, init])

    const loadUser = useCallback(async () => {
        let accounts = provider.getSigner()
        let account = await accounts.getAddress()
        return account
    }, [provider])

    const loadNetwork = useCallback(async () => {
        let netId = await provider.getNetwork()
        setNetworkId(netId["name"])
    }, [provider, setNetworkId])

    const loadEthBalance = useCallback(async (user) => {
        let balance = await provider.getBalance(user)
        setEthBalance(balance)
    }, [provider, setEthBalance])

    const loadDaiBalance = useCallback(async (user) => {
        let balance = await daiContract.balanceOf(user)
        setDaiBalance(balance.toString())
    }, [daiContract, setDaiBalance])

    const loadSbtBalance = useCallback(async (user) => {
        let balance = await sbtTokenContract.balanceOf(user)
        setSbtBalance(balance.toString())
    }, [sbtTokenContract, setSbtBalance])

    const loadStakingBalance = useCallback(async (user) => {
        let balance = await sbtFarmContract.stakingBalance(user)
        setStakingBalance(balance.toString())
    }, [setStakingBalance, sbtFarmContract])

    const loadSbtYield = useCallback(async (user) => {
        let balance = await sbtFarmContract.calculateYieldTotal(user)
        setSbtYield(balance.toString())
    }, [setSbtYield, sbtFarmContract])

    const loadSbtUnrealizedYield = useCallback(async (user) => {
        let balance = await sbtFarmContract.sbtBalance(user)
        setSbtUnrealizedYield(balance.toString())
    }, [setSbtUnrealizedYield, sbtFarmContract])


    const userDidMount = useCallback(async () => {
        try {
            await loadUser().then(res => {
                setUserAddress(res)
                loadEthBalance(res)
                loadDaiBalance(res)
                loadSbtBalance(res)
                loadStakingBalance(res)
                loadSbtYield(res)
                loadSbtUnrealizedYield(res)
            })
        } catch (error) {
            console.log(error)
        }
        await loadNetwork()
    }, [
        loadUser,
        loadNetwork,
        loadEthBalance,
        loadDaiBalance,
        loadSbtBalance,
        loadStakingBalance,
        setUserAddress,
        loadSbtYield,
        loadSbtUnrealizedYield
    ])

    useEffect(() => {
        if (userAddress === "" && init === true) {
            userDidMount()
        }
    }, [userDidMount, init, userAddress])

    const loadOwner = useCallback(async () => {
        let contractOwner = await lotteryContract.owner()
        setOwner(contractOwner)
    }, [lotteryContract, setOwner])

    const loadLotteryPool = useCallback(async () => {
        let balance = await sbtTokenContract.balanceOf(lotteryContract.address)
        setLotteryBalance(ethers.utils.formatEther(balance))
    }, [lotteryContract, sbtTokenContract])

    const loadLinkBalance = useCallback(async () => {
        let balance = await linkContract.balanceOf(lotteryContract.address)
        setLinkBalance(ethers.utils.formatEther(balance))
    }, [lotteryContract, linkContract, setLinkBalance])

    const loadLotteryCount = useCallback(async () => {
        let count = await lotteryContract.lotteryCount()
        setLotteryCount(count.toString())
        return count.toString()
    }, [lotteryContract])

    const loadWinningNumber = useCallback(async (lottoCount) => {
        let number = await lotteryContract.winningNumber(lottoCount)
        setWinningNumber(number.toString())
    }, [setWinningNumber, lotteryContract])

    const contractStateDidMount = useCallback(async () => {
        await loadOwner()
        await loadLotteryPool()
        await loadLinkBalance()
        await loadLotteryCount()
            .then(async (res) => {
                await loadWinningNumber(res)
            })
    }, [
        loadOwner,
        loadLotteryPool,
        loadLinkBalance,
        loadLotteryCount,
        loadWinningNumber,
    ])

    useEffect(() => {
        if (init === true) {
            contractStateDidMount()
        }
    }, [init, contractStateDidMount])

    useEffect(() => {
        if (userAddress !== "") {
            sbtFarmContract.on("Stake", async (userAddress) => {
                await loadDaiBalance(userAddress)
                await loadStakingBalance(userAddress)
            });

            sbtFarmContract.on("Unstake", async (userAddress) => {
                await loadDaiBalance(userAddress)
                await loadStakingBalance(userAddress)
            })

            sbtFarmContract.on("YieldWithdraw", async (userAddress) => {
                await loadSbtUnrealizedYield(userAddress)
                await loadSbtYield(userAddress)
                await loadSbtBalance(userAddress)
            })

            sbtFarmContract.on("MintNFT", async (userAddress) => {
                await loadSbtBalance(userAddress)
            })

            /**
             * @notice Lottery events
             */

            lotteryContract.on("NumberReceived", async (userAddress) => {
                await loadLotteryCount()
                    .then(async (res) => {
                        await loadWinningNumber(res)
                    })
            })

            lotteryContract.on("LotteryClaim", async (userAddress) => {
                await loadSbtBalance(userAddress)
                await loadLotteryPool()
            })

            lotteryContract.on("WithdrawLink", async (userAddress) => {
                await loadLinkBalance()
            })
        }

        if (stakingBalance > 0) {
            let interval = null
            interval = setInterval(() => {
                loadSbtYield(userAddress)
            }, 20000)
            return () => clearInterval(interval)
        }

    }, [
        sbtFarmContract,
        userAddress,
        stakingBalance,
        lotteryContract,
        loadDaiBalance,
        loadStakingBalance,
        loadSbtUnrealizedYield,
        loadSbtYield,
        loadSbtBalance,
        loadWinningNumber,
        loadLotteryContract,
        loadLinkBalance,
        loadLotteryCount,
        loadLotteryPool,
    ])

    return (
        <Container>
            <ContractProvider value={contractState}>
                <UserProvider value={userState}>
                    <Main />
                </UserProvider>
            </ContractProvider>
        </Container>
    );
}

export default App;
