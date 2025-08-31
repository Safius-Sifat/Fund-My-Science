require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
                details: {
                    yul: false,
                }
            },
            viaIR: false,
        }
    },

    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
            accounts: {
                mnemonic: "test test test test test test test test test test test junk",
                count: 20,
            },
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
            gasPrice: "auto",
            gasMultiplier: 1.2,
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/your-api-key",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1,
            gasPrice: "auto",
            gasMultiplier: 1.1,
        }
    },

    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY,
            mainnet: process.env.ETHERSCAN_API_KEY,
        }
    },

    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
        gasPrice: 20,
        token: "ETH",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },

    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
        only: [':FundMyScience$'],
    },

    mocha: {
        timeout: 60000,
    },

    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};
