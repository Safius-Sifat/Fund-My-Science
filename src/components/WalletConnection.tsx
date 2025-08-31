'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { useState } from 'react'

export default function WalletConnection() {
    const {
        isConnected,
        account,
        chainId,
        isCorrectNetwork,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork
    } = useWeb3()

    const [showDetails, setShowDetails] = useState(false)

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const getNetworkName = (chainId: number | null) => {
        switch (chainId) {
            case 1: return 'Ethereum Mainnet'
            case 11155111: return 'Sepolia Testnet'
            case 31337: return 'Localhost'
            default: return 'Unknown Network'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Connecting...</span>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col space-y-2">
                <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                    </svg>
                    <span>Connect Wallet</span>
                </button>
                {error && (
                    <p className="text-red-600 text-xs">{error}</p>
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                {/* Network Status */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${isCorrectNetwork
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                    <span>{getNetworkName(chainId)}</span>
                </div>

                {/* Account Info */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{formatAddress(account!)}</span>
                    <svg className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Dropdown Details */}
            {showDetails && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                        <div className="space-y-3">
                            {/* Account Details */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">ACCOUNT</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono text-gray-900">{account}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(account!)}
                                        className="text-blue-600 hover:text-blue-700 text-xs"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Network Details */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">NETWORK</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-900">{getNetworkName(chainId)}</span>
                                    <span className="text-xs text-gray-500">Chain ID: {chainId}</span>
                                </div>
                            </div>

                            {/* Network Warning */}
                            {!isCorrectNetwork && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Wrong Network</p>
                                            <p className="text-xs text-yellow-700">Please switch to the correct network to use all features.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => switchNetwork(process.env.NODE_ENV === 'development' ? 31337 : 11155111)}
                                        className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium"
                                    >
                                        Switch Network
                                    </button>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-3 border-t border-gray-200">
                                <button
                                    onClick={disconnectWallet}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Disconnect Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute right-0 mt-2 w-80 bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
