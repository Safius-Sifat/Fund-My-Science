'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { syncInvestmentToBlockchain } from '@/lib/blockchain'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface InvestmentModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: number
    blockchainProjectId: number | null
    projectTitle: string
    fundingGoal: number
    fundsRaised: number
    researcherId: string
    onInvestmentSuccess: () => void
}

export default function InvestmentModal({
    isOpen,
    onClose,
    projectId,
    blockchainProjectId,
    projectTitle,
    fundingGoal,
    fundsRaised,
    researcherId,
    onInvestmentSuccess
}: InvestmentModalProps) {
    const { user } = useAuth()
    const web3 = useWeb3()
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [blockchainProcessing, setBlockchainProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const remainingFunding = fundingGoal - fundsRaised
    const minInvestment = 100 // Minimum $100 investment

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !amount) return

        const investmentAmount = Number(amount)

        // Validation
        if (user.id === researcherId) {
            setError('Researchers cannot invest in their own projects')
            return
        }

        if (investmentAmount < minInvestment) {
            setError(`Minimum investment is $${minInvestment}`)
            return
        }

        if (investmentAmount > remainingFunding) {
            setError(`Investment cannot exceed remaining funding needed: $${remainingFunding.toLocaleString()}`)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            console.log('💰 Starting investment process...')

            // Check if project is on blockchain
            if (!blockchainProjectId) {
                console.log('⚠️ Project not deployed to blockchain, using database-only investment')
            }

            // Method 1: If wallet connected and project is on blockchain, use blockchain integration
            if (web3.account && web3.contract && blockchainProjectId) {
                console.log('🔗 Using blockchain investment flow')
                setBlockchainProcessing(true)

                // Convert to ETH (assuming 1 USD = 0.0003 ETH for demo purposes)
                const ethAmount = (investmentAmount * 0.0003).toFixed(6)

                try {
                    const investmentData = {
                        projectId: blockchainProjectId, // Use blockchain ID instead of database ID
                        amount: ethAmount,
                        transactionHash: ''
                    }

                    const blockchainResult = await syncInvestmentToBlockchain(investmentData, web3)

                    if (blockchainResult.success) {
                        console.log('✅ Investment completed on blockchain:', blockchainResult.transactionHash)

                        // Success
                        onInvestmentSuccess()
                        onClose()
                        setAmount('')
                        return
                    } else {
                        console.warn('⚠️ Blockchain investment failed, falling back to database only:', blockchainResult.error)
                        // Fall through to database-only method
                    }
                } catch (blockchainError) {
                    console.error('❌ Blockchain investment error:', blockchainError)
                    setError('Blockchain transaction failed. Saving to database only.')
                    // Fall through to database-only method
                } finally {
                    setBlockchainProcessing(false)
                }
            }

            // Method 2: Database-only investment (fallback)
            console.log('💾 Using database-only investment flow')
            const { error: investmentError } = await supabase
                .from('investments')
                .insert({
                    project_id: projectId,
                    investor_id: user.id,
                    amount: investmentAmount,
                    transaction_hash: `mock_tx_${Date.now()}`, // Mock transaction hash
                    blockchain_status: web3.account ? 'failed' : 'pending'
                })

            if (investmentError) {
                setError(investmentError.message)
                return
            }

            // Update project funds_raised
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    funds_raised: fundsRaised + investmentAmount
                })
                .eq('id', projectId)

            if (updateError) {
                setError(updateError.message)
                return
            }

            // Success
            onInvestmentSuccess()
            onClose()
            setAmount('')

        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Invest in Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">{projectTitle}</h3>

                    {/* Blockchain Status Indicator */}
                    <div className="mb-3">
                        {blockchainProjectId ? (
                            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Blockchain Project ID: {blockchainProjectId}
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Database-only (Not on blockchain)
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Funding Goal:</span>
                            <span className="font-medium">${fundingGoal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Already Raised:</span>
                            <span className="font-medium text-green-600">${fundsRaised.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Remaining:</span>
                            <span className="font-medium text-blue-600">${remainingFunding.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.min((fundsRaised / fundingGoal) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount (USD)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={minInvestment}
                                max={remainingFunding}
                                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1000"
                                required
                            />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Minimum: ${minInvestment.toLocaleString()} • Maximum: ${remainingFunding.toLocaleString()}
                        </p>
                    </div>

                    {/* Blockchain Status Indicator */}
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                                {web3.account ? (
                                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                ) : (
                                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                )}
                            </div>
                            <div className="text-sm">
                                {web3.account ? (
                                    <span className="text-green-700 font-medium">
                                        🔗 Blockchain Connected - Secure investment via smart contract
                                    </span>
                                ) : (
                                    <span className="text-yellow-700">
                                        💾 Database Only - Connect wallet for blockchain security
                                    </span>
                                )}
                            </div>
                        </div>
                        {web3.account && (
                            <p className="text-xs text-gray-600 mt-1">
                                Wallet: {web3.account.slice(0, 8)}...{web3.account.slice(-6)}
                            </p>
                        )}
                        {blockchainProcessing && (
                            <div className="mt-2 flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-blue-600">Processing blockchain transaction...</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Investment Terms</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Funds released based on milestone completion</li>
                            <li>• Investment secured by smart contract escrow</li>
                            <li>• Potential returns based on project success</li>
                            <li>• DAO governance rights included</li>
                        </ul>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !amount}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Invest Now'}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>
                        ⚠️ This is a demo. In production, this would connect to your wallet
                        and interact with smart contracts on the blockchain.
                    </p>
                </div>
            </div>
        </div>
    )
}
