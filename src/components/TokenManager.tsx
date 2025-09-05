'use client'

import { useWeb3 } from '@/contexts/Web3FactoryContext'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

export default function TokenManager() {
    const { account, provider, getProjectEscrow } = useWeb3()
    const [tokenInfo, setTokenInfo] = useState<{
        address: string
        name: string
        symbol: string
        decimals: number
        balance: string
        totalSupply: string
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const [addingToWallet, setAddingToWallet] = useState(false)

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
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const PROJECT_ESCROW_ABI = [
        {
            "inputs": [],
            "name": "projectToken",
            "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const getProjectTokenInfo = async () => {
        if (!account || !provider) return

        setLoading(true)
        try {
            console.log('🔍 Getting project token info for project 1...')

            // Get escrow address for project 1
            const escrowAddress = await getProjectEscrow(1)
            console.log('📍 Escrow address:', escrowAddress)

            if (escrowAddress && escrowAddress !== ethers.ZeroAddress) {
                const escrowContract = new ethers.Contract(escrowAddress, PROJECT_ESCROW_ABI, provider)

                // Get project token address
                const tokenAddress = await escrowContract.projectToken()
                console.log('🪙 Project token address:', tokenAddress)

                if (tokenAddress && tokenAddress !== ethers.ZeroAddress) {
                    const tokenContract = new ethers.Contract(tokenAddress, PROJECT_TOKEN_ABI, provider)

                    // Get all token info
                    const [name, symbol, decimals, balance, totalSupply] = await Promise.all([
                        tokenContract.name(),
                        tokenContract.symbol(),
                        tokenContract.decimals(),
                        tokenContract.balanceOf(account),
                        tokenContract.totalSupply()
                    ])

                    const tokenInfo = {
                        address: tokenAddress,
                        name,
                        symbol,
                        decimals: Number(decimals),
                        balance: ethers.formatUnits(balance, decimals),
                        totalSupply: ethers.formatUnits(totalSupply, decimals)
                    }

                    console.log('🎯 Token info:', tokenInfo)
                    setTokenInfo(tokenInfo)
                } else {
                    console.log('❌ No project token found')
                    setTokenInfo(null)
                }
            } else {
                console.log('❌ Project escrow not found')
                setTokenInfo(null)
            }
        } catch (error) {
            console.error('Error getting token info:', error)
        } finally {
            setLoading(false)
        }
    }

    const addTokenToMetaMask = async () => {
        if (!tokenInfo || !window.ethereum) return

        setAddingToWallet(true)
        try {
            const added = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: tokenInfo.address,
                        symbol: tokenInfo.symbol,
                        decimals: tokenInfo.decimals,
                        image: '', // You can add a token image URL here
                    },
                },
            })

            if (added) {
                alert('✅ Token added to MetaMask successfully!')
            } else {
                alert('❌ Token was not added to MetaMask')
            }
        } catch (error) {
            console.error('Error adding token to MetaMask:', error)
            alert('❌ Error adding token to MetaMask')
        } finally {
            setAddingToWallet(false)
        }
    }

    const copyTokenAddress = () => {
        if (tokenInfo?.address) {
            navigator.clipboard.writeText(tokenInfo.address)
            alert('📋 Token address copied to clipboard!')
        }
    }

    useEffect(() => {
        if (account) {
            getProjectTokenInfo()
        }
    }, [account])

    if (!account) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🪙 Project Token Manager</h2>
                <p className="text-gray-600">Connect your wallet to manage project tokens</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🪙 Project Token Manager</h2>
                <button
                    onClick={getProjectTokenInfo}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {tokenInfo ? (
                <div className="space-y-6">
                    {/* Token Details */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-purple-800 mb-3">📊 Token Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Token Name</p>
                                <p className="font-semibold">{tokenInfo.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Symbol</p>
                                <p className="font-semibold">{tokenInfo.symbol}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Your Balance</p>
                                <p className="font-semibold text-purple-600 text-xl">
                                    {parseFloat(tokenInfo.balance).toFixed(6)} {tokenInfo.symbol}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Supply</p>
                                <p className="font-semibold">{parseFloat(tokenInfo.totalSupply).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-600">Contract Address</p>
                            <div className="flex items-center space-x-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1">
                                    {tokenInfo.address}
                                </code>
                                <button
                                    onClick={copyTokenAddress}
                                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add to MetaMask */}
                    <div className="bg-orange-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-orange-800 mb-3">🦊 Add to MetaMask</h3>
                        <p className="text-orange-700 text-sm mb-4">
                            Add this project token to your MetaMask wallet to see your balance and make transfers.
                        </p>
                        <button
                            onClick={addTokenToMetaMask}
                            disabled={addingToWallet}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 w-full"
                        >
                            {addingToWallet ? 'Adding to MetaMask...' : '🦊 Add Token to MetaMask'}
                        </button>
                    </div>

                    {/* Manual Addition Instructions */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">📝 Manual Addition</h3>
                        <p className="text-blue-700 text-sm mb-3">
                            If the automatic addition doesn&apos;t work, you can manually add the token:
                        </p>
                        <ol className="text-blue-700 text-sm space-y-2">
                            <li>1. Open MetaMask and go to the &quot;Assets&quot; tab</li>
                            <li>2. Click &quot;Import tokens&quot;</li>
                            <li>3. Select &quot;Custom Token&quot;</li>
                            <li>4. Paste the contract address: <code className="bg-white px-1 rounded">{tokenInfo.address}</code></li>
                            <li>5. MetaMask should auto-fill the symbol and decimals</li>
                            <li>6. Click &quot;Add Custom Token&quot;</li>
                        </ol>
                    </div>

                    {/* Balance Analysis */}
                    {parseFloat(tokenInfo.balance) === 0 && (
                        <div className="bg-red-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Zero Balance Analysis</h3>
                            <p className="text-red-700 text-sm">
                                Your token balance shows 0, but you have an 81% investment share. This could be because:
                            </p>
                            <ul className="text-red-700 text-sm mt-2 space-y-1">
                                <li>• Tokens might not have been minted yet</li>
                                <li>• There might be a delay in token distribution</li>
                                <li>• The investment might be in the escrow but tokens pending</li>
                                <li>• Check the browser console for any error messages</li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                        {loading ? 'Loading project token information...' : 'No project token found for Project 1'}
                    </p>
                    {!loading && (
                        <p className="text-sm text-gray-500">
                            Make sure you have invested in the project and the token has been created.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
