'use client'

import { useWeb3 } from '@/contexts/Web3Context'
import { useCallback, useEffect, useState } from 'react'

interface BlockchainStatusProps {
    projectId?: number
    className?: string
}

export default function BlockchainStatus({ projectId, className = '' }: BlockchainStatusProps) {
    const { isConnected, isCorrectNetwork, contract, account } = useWeb3()
    const [loading, setLoading] = useState(false)

    const fetchBlockchainData = useCallback(async () => {
        if (!contract || !projectId) return

        try {
            setLoading(true)
            // This would fetch actual blockchain data
            // For now, showing connection status
            console.log('Blockchain data:', {
                connected: true,
                network: isCorrectNetwork ? 'Correct' : 'Wrong',
                account: account
            })
        } catch (error) {
            console.error('Error fetching blockchain data:', error)
        } finally {
            setLoading(false)
        }
    }, [contract, projectId, isCorrectNetwork, account])

    useEffect(() => {
        if (projectId && contract && isConnected && isCorrectNetwork) {
            fetchBlockchainData()
        }
    }, [projectId, contract, isConnected, isCorrectNetwork, fetchBlockchainData])

    if (!isConnected) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Not connected to blockchain</span>
            </div>
        )
    }

    if (!isCorrectNetwork) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-700">Wrong network - please switch</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700">Syncing with blockchain...</span>
            </div>
        )
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700">
                Blockchain connected {projectId ? '• Project synced' : ''}
            </span>
        </div>
    )
}
