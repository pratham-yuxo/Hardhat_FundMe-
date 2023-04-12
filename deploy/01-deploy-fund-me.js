// ********  deploying with hardhat deploy
// yarn hardhat deploy will deploy all the contracts in deploy folder that's why we are numbering them

// hardhat deploy will look for this function
// hardhat deploy on deploying will automatically call the function we specify here unlike we did earlier with deploy script where we define and call main fuction

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()
//           hre from hardaht
// getNamedAccount -> see in hardhat.config.js , you can choose which account you want to use
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        // these arguments will get passed to the constructor of fund me .sol
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}
// when going for localhost or hardhat network we want to use mock

module.exports.tags = ["all", "fundme"]
// 10 : 24

// 10 :13 -> just see this
