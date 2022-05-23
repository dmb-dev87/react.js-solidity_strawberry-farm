# StrawberryFarm Frontend
After deployment, the list of requisite addresses will be logged into your terminal. Add the addresses to the frontend/src/App.js file inside the correct load contract functions. They will look like this:
```
const loadSbtFarmContract = useCallback(async(_provider) => {
    let sbtFarmAddress = "0x..."
    let contract = new ethers.Contract(sbtFarmAddress, SbtFarm.abi,_provider)
    setSbtFarmContract(contract)
    }, [setSbtFarmContract])
```
***
Inside the Sbt-farm/frontend directory:
```
npm i
```
before finally:
```
npm run start
```
