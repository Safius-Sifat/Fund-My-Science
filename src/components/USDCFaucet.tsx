'use client'

import { useWeb3 } from '@/contexts/Web3FactoryContext'
import { useCallback, useEffect, useState } from 'react'

export default function USDCFaucet() {
    const { account, usdcContract, getUSDCBalance } = useWeb3()
    const [isLoading, setIsLoading] = useState(false)
    const [balance, setBalance] = useState<string>('0')
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    const updateBalance = useCallback(async () => {
        if (!account) return
        try {
            const newBalance = await getUSDCBalance(account)
            setBalance(newBalance)
        } catch (error) {
            console.error('Failed to get balance:', error)
        }
    }, [account, getUSDCBalance])

    const claimTestTokens = async () => {
        if (!usdcContract || !account) {
            setStatus({
                type: 'error',
                message: 'Wallet not connected'
            })
            return
        }

        setIsLoading(true)
        setStatus({ type: null, message: '' })

        try {
            console.log('🪙 Requesting test USDC tokens...')
            const tx = await usdcContract.faucet()
            console.log('📤 Transaction sent:', tx.hash)

            setStatus({
                type: 'success',
                message: 'Transaction submitted! Waiting for confirmation...'
            })

            const receipt = await tx.wait()
            console.log('✅ Test tokens received:', receipt.hash)

            setStatus({
                type: 'success',
                message: `Success! You received 1000 test USDC tokens. TX: ${receipt.hash}`
            })

            // Update balance
            await updateBalance()
        } catch (error) {
            console.error('❌ Failed to get test tokens:', error)
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to get test tokens'
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Load balance when component mounts or account changes
    useEffect(() => {
        updateBalance()
    }, [account, updateBalance])

    if (!account) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">🪙 Test USDC Faucet</h3>
                <p className="text-yellow-700 text-sm">Connect your wallet to get test USDC tokens</p>
            </div>
        )
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-blue-800 mb-4">🪙 Test USDC Faucet</h3>

            <div className="mb-4">
                <p className="text-sm text-blue-700 mb-2">Your Test USDC Balance:</p>
                <p className="text-2xl font-bold text-blue-900">{balance} USDC</p>
            </div>

            <button
                onClick={claimTestTokens}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
            >
                {isLoading ? 'Claiming...' : 'Get 1000 Test USDC'}
            </button>

            {status.type && (
                <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {status.message}
                    {status.type === 'success' && (
                        <button
                            onClick={() => setStatus({ type: null, message: '' })}
                            className="ml-2 underline"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            )}

            <div className="text-xs text-blue-600 mt-4 space-y-1">
                <p>💡 This faucet provides test USDC for testing purposes</p>
                <p>🔄 You can claim tokens multiple times</p>
                <p>⚠️ These tokens have no real value</p>
            </div>
        </div>
    )
}
