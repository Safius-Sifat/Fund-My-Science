'use client'

import { useWeb3 } from '@/contexts/Web3FactoryContext'
import { useCallback, useEffect, useState } from 'react'

interface ProjectInvestmentProps {
    projectId: number
    projectTitle: string
    fundingGoal: string
    currentFunding: string
    researcherAddress: string
}

export default function ProjectInvestment({
    projectId,
    projectTitle,
    fundingGoal,
    currentFunding,
    researcherAddress
}: ProjectInvestmentProps) {
    const {
        account,
        isConnecting,
        connectWallet,
        investInProject,
        getUSDCBalance,
        getUSDCAllowance,
        getProjectEscrow
    } = useWeb3()

    const [investAmount, setInvestAmount] = useState('')
    const [isInvesting, setIsInvesting] = useState(false)
    const [usdcBalance, setUsdcBalance] = useState<string>('0')
    const [allowance, setAllowance] = useState<string>('0')
    const [escrowAddress, setEscrowAddress] = useState<string>('')
    const [investmentStatus, setInvestmentStatus] = useState<{
        type: 'success' | 'error' | 'info' | null
        message: string
    }>({ type: null, message: '' })

    // Load user's USDC balance and allowance when account changes
    const loadBalanceInfo = useCallback(async () => {
        if (!account) return

        try {
            const [balance, escrow] = await Promise.all([
                getUSDCBalance(account),
                getProjectEscrow(projectId)
            ])

            setUsdcBalance(balance)
            setEscrowAddress(escrow)

            if (escrow) {
                const currentAllowance = await getUSDCAllowance(account, escrow)
                setAllowance(currentAllowance)
            }
        } catch (error) {
            console.error('Failed to load balance info:', error)
        }
    }, [account, getUSDCBalance, getProjectEscrow, getUSDCAllowance, projectId])

    // Load balance info when component mounts or account changes
    useEffect(() => {
        loadBalanceInfo()
    }, [loadBalanceInfo])

    const handleInvest = async () => {
        if (!account) {
            setInvestmentStatus({
                type: 'error',
                message: 'Please connect your wallet first'
            })
            return
        }

        if (!investAmount || parseFloat(investAmount) <= 0) {
            setInvestmentStatus({
                type: 'error',
                message: 'Please enter a valid investment amount'
            })
            return
        }

        const amount = parseFloat(investAmount)
        const balance = parseFloat(usdcBalance)

        if (amount > balance) {
            setInvestmentStatus({
                type: 'error',
                message: `Insufficient USDC balance. You have ${usdcBalance} USDC`
            })
            return
        }

        setIsInvesting(true)
        setInvestmentStatus({ type: 'info', message: 'Processing investment...' })

        try {
            const result = await investInProject(projectId, investAmount)

            if (result.success) {
                setInvestmentStatus({
                    type: 'success',
                    message: `Investment successful! Transaction: ${result.transactionHash}`
                })
                setInvestAmount('')
                // Refresh balance info
                await loadBalanceInfo()
            } else {
                setInvestmentStatus({
                    type: 'error',
                    message: result.error || 'Investment failed'
                })
            }
        } catch (error) {
            console.error('Investment error:', error)
            setInvestmentStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Investment failed'
            })
        } finally {
            setIsInvesting(false)
        }
    }

    const progressPercentage = Math.min(
        (parseFloat(currentFunding) / parseFloat(fundingGoal)) * 100,
        100
    )

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{projectTitle}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Researcher: {researcherAddress?.slice(0, 6)}...{researcherAddress?.slice(-4)}
                </p>

                {/* Funding Progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{currentFunding} USDC raised</span>
                        <span>{fundingGoal} USDC goal</span>
                    </div>
                </div>
            </div>

            {!account ? (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet to Invest'}
                </button>
            ) : (
                <div className="space-y-4">
                    {/* User Balance Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Your USDC Balance</p>
                        <p className="text-lg font-semibold text-gray-900">{usdcBalance} USDC</p>
                        {escrowAddress && (
                            <p className="text-xs text-gray-500 mt-1">
                                Allowance: {allowance} USDC
                            </p>
                        )}
                    </div>

                    {/* Investment Input */}
                    <div>
                        <label htmlFor="investAmount" className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount (USDC)
                        </label>
                        <input
                            type="number"
                            id="investAmount"
                            value={investAmount}
                            onChange={(e) => setInvestAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {['10', '50', '100'].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setInvestAmount(amount)}
                                className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {amount} USDC
                            </button>
                        ))}
                    </div>

                    {/* Invest Button */}
                    <button
                        onClick={handleInvest}
                        disabled={isInvesting || !investAmount || parseFloat(investAmount) <= 0}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isInvesting ? 'Processing...' : 'Invest in Project'}
                    </button>

                    {/* Status Messages */}
                    {investmentStatus.type && (
                        <div className={`p-4 rounded-lg ${investmentStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                                investmentStatus.type === 'error' ? 'bg-red-50 text-red-800' :
                                    'bg-blue-50 text-blue-800'
                            }`}>
                            <p className="text-sm">{investmentStatus.message}</p>
                            {investmentStatus.type === 'success' && (
                                <button
                                    onClick={() => setInvestmentStatus({ type: null, message: '' })}
                                    className="mt-2 text-xs underline"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    )}

                    {/* Investment Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>💡 Your investment will be converted to project tokens</p>
                        <p>🏦 Funds are secured in a smart contract escrow</p>
                        <p>🎯 Released to researcher upon milestone completion</p>
                    </div>
                </div>
            )}
        </div>
    )
}
