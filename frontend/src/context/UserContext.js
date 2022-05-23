import React, { useContext } from 'react'

export const UserContext = React.createContext({
    userAddress: "",
    setUserAddress: () => [],
    ethBalance: "",
    setEthBalance: () => { },
    daiBalance: "",
    setDaiBalance: () => { },
    sbtBalance: "",
    setSbtBalance: () => { },
    stakingBalance: "",
    setStakingBalance: () => { },
    sbtYield: "",
    setSbtYield: () => { },
    sbtUnrealizedYield: "",
    setSbtUnrealizedYield: () => { },
    userNFTs: "",
    setUserNFTs: () => { },
})

export const UserProvider = UserContext.Provider
export const useUser = () => useContext(UserContext)