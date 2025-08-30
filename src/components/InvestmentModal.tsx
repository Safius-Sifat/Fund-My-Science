'use client'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface InvestmentModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: number
    projectTitle: string
    fundingGoal: number
    fundsRaised: number
    onInvestmentSuccess: () => void
}

export default function InvestmentModal({
    isOpen,
    onClose,
    projectId,
    projectTitle,
    fundingGoal,
    fundsRaised,
    onInvestmentSuccess
}: InvestmentModalProps) {
    const { user } = useAuth()
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const remainingFunding = fundingGoal - fundsRaised
    const minInvestment = 100 // Minimum $100 investment

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !amount) return

        const investmentAmount = Number(amount)

        // Validation
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
            // In a real implementation, this would interact with smart contracts
            // For now, we'll just record the investment in the database
            const { error: investmentError } = await supabase
                .from('investments')
                .insert({
                    project_id: projectId,
                    investor_id: user.id,
                    amount: investmentAmount,
                    transaction_hash: `mock_tx_${Date.now()}` // Mock transaction hash
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
