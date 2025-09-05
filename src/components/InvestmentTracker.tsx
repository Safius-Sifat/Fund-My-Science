'use client'

import { useWeb3 } from '@/contexts/Web3FactoryContext'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

export default function InvestmentTracker() {
    const {
        account,
        provider,
        factoryContract,
        usdcContract,
        getProjectEscrow,
        getProjectInfo,
        getUSDCBalance
    } = useWeb3()

    const [investments, setInvestments] = useState<any[]>([])
    const [projectTokens, setProjectTokens] = useState<any[]>([])
    const [balances, setBalances] = useState({
        usdc: '0',
        eth: '0'
    })
    const [loading, setLoading] = useState(false)

    const PROJECT_TOKEN_ABI = [
        {
            "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const PROJECT_ESCROW_ABI = [
        {
            "inputs": [{ "internalType": "address", "name": "investor", "type": "address" }],
            "name": "getInvestorInfo",
            "outputs": [
                { "internalType": "uint256", "name": "totalContribution", "type": "uint256" },
                { "internalType": "uint256", "name": "tokenBalance", "type": "uint256" },
                { "internalType": "uint256", "name": "sharePercentage", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "projectToken",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getProjectInfo",
            "outputs": [
                { "internalType": "uint256", "name": "projectId", "type": "uint256" },
                { "internalType": "address", "name": "researcherAddress", "type": "address" },
                { "internalType": "uint256", "name": "goal", "type": "uint256" },
                { "internalType": "uint256", "name": "funded", "type": "uint256" },
                { "internalType": "uint256", "name": "remaining", "type": "uint256" },
                { "internalType": "uint256", "name": "investorCount", "type": "uint256" },
                { "internalType": "bool", "name": "completed", "type": "bool" },
                { "internalType": "uint256", "name": "milestonesTotal", "type": "uint256" },
                { "internalType": "uint256", "name": "milestonesReleasedCount", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const trackInvestments = async () => {
        if (!account || !provider || !factoryContract) {
            console.log('Wallet not connected')
            return
        }

        setLoading(true)
        try {
            console.log('🔍 Tracking investments for:', account)

            // Update balances
            const ethBalance = await provider.getBalance(account)
            const usdcBalance = await getUSDCBalance(account)

            setBalances({
                eth: ethers.formatEther(ethBalance),
                usdc: usdcBalance
            })

            // Check test project (ID 1)
            const escrowAddress = await getProjectEscrow(1)

            if (escrowAddress && escrowAddress !== ethers.ZeroAddress) {
                console.log('📍 Project 1 escrow address:', escrowAddress)

                const escrowContract = new ethers.Contract(escrowAddress, PROJECT_ESCROW_ABI, provider)

                try {
                    // Get your investment info
                    const investorInfo = await escrowContract.getInvestorInfo(account)
                    const projectInfo = await escrowContract.getProjectInfo()

                    const contribution = ethers.formatUnits(investorInfo.totalContribution, 6)
                    const tokenBalance = ethers.formatUnits(investorInfo.tokenBalance, 18) // Project tokens are 18 decimals
                    const sharePercentage = Number(investorInfo.sharePercentage) / 100 // Convert from basis points

                    if (Number(contribution) > 0) {
                        console.log('💰 Found investment:', {
                            contribution,
                            tokenBalance,
                            sharePercentage
                        })

                        setInvestments([{
                            projectId: 1,
                            escrowAddress,
                            contribution,
                            sharePercentage,
                            projectGoal: ethers.formatUnits(projectInfo.goal, 6),
                            projectFunded: ethers.formatUnits(projectInfo.funded, 6),
                            investorCount: Number(projectInfo.investorCount)
                        }])

                        // Get project token info
                        try {
                            const tokenAddress = await escrowContract.projectToken()
                            console.log('🪙 Project token address:', tokenAddress)

                            if (tokenAddress && tokenAddress !== ethers.ZeroAddress) {
                                const tokenContract = new ethers.Contract(tokenAddress, PROJECT_TOKEN_ABI, provider)

                                const tokenName = await tokenContract.name()
                                const tokenSymbol = await tokenContract.symbol()
                                const tokenDecimals = await tokenContract.decimals()
                                const myTokenBalance = await tokenContract.balanceOf(account)

                                setProjectTokens([{
                                    address: tokenAddress,
                                    name: tokenName,
                                    symbol: tokenSymbol,
                                    decimals: Number(tokenDecimals),
                                    balance: ethers.formatUnits(myTokenBalance, tokenDecimals),
                                    projectId: 1
                                }])
                            }
                        } catch (tokenError) {
                            console.error('Error getting token info:', tokenError)
                        }
                    } else {
                        console.log('❌ No investment found in project 1')
                        setInvestments([])
                        setProjectTokens([])
                    }
                } catch (investorError) {
                    console.error('Error getting investor info:', investorError)
                }
            } else {
                console.log('❌ Project 1 not found')
            }

        } catch (error) {
            console.error('Error tracking investments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (account) {
            trackInvestments()
        }
    }, [account])

    if (!account) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💼 Investment Tracker</h2>
                <p className="text-gray-600">Connect your wallet to track investments</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">💼 Your Investment Portfolio</h2>
                <button
                    onClick={trackInvestments}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Current Balances */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">💵 USDC Balance</h3>
                    <p className="text-2xl font-bold text-green-600">{balances.usdc}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">⚡ ETH Balance</h3>
                    <p className="text-2xl font-bold text-blue-600">{parseFloat(balances.eth).toFixed(4)}</p>
                </div>
            </div>

            {/* Active Investments */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 Active Investments</h3>
                {investments.length > 0 ? (
                    <div className="space-y-4">
                        {investments.map((investment, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Project ID</p>
                                        <p className="font-semibold">{investment.projectId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Your Investment</p>
                                        <p className="font-semibold text-green-600">{investment.contribution} USDC</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Your Share</p>
                                        <p className="font-semibold text-blue-600">{investment.sharePercentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Project Progress</p>
                                        <p className="font-semibold">{investment.projectFunded} / {investment.projectGoal} USDC</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Escrow: {investment.escrowAddress}</p>
                                    <p>Total Investors: {investment.investorCount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 italic">No active investments found</p>
                )}
            </div>

            {/* Project Tokens */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🪙 Project Tokens</h3>
                {projectTokens.length > 0 ? (
                    <div className="space-y-4">
                        {projectTokens.map((token, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-purple-50">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Token Name</p>
                                        <p className="font-semibold">{token.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Symbol</p>
                                        <p className="font-semibold">{token.symbol}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Your Balance</p>
                                        <p className="font-semibold text-purple-600">{parseFloat(token.balance).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Project ID</p>
                                        <p className="font-semibold">{token.projectId}</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Token Address: {token.address}</p>
                                    <p>Decimals: {token.decimals}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 italic">No project tokens found</p>
                )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">💡 What This Shows:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>USDC Balance:</strong> Your remaining stable coin balance</li>
                    <li>• <strong>Active Investments:</strong> USDC you've invested in projects</li>
                    <li>• <strong>Project Tokens:</strong> ERC-20 tokens representing your project shares</li>
                    <li>• <strong>Share Percentage:</strong> Your ownership stake in the project</li>
                    <li>• <strong>Escrow Address:</strong> Where your investment is securely held</li>
                </ul>
            </div>
        </div>
    )
}
