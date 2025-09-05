'use client'

import { useWeb3 } from '@/contexts/Web3FactoryContext'
import { useState } from 'react'

export default function ComprehensiveTest() {
    const {
        account,
        provider,
        factoryContract,
        usdcContract,
        getUSDCBalance,
        getProjectEscrow,
        getProjectInfo,
        connectWallet
    } = useWeb3()

    const [testResults, setTestResults] = useState<{
        [key: string]: { status: 'pending' | 'success' | 'error', message: string }
    }>({})

    const [isRunning, setIsRunning] = useState(false)

    const updateTest = (testName: string, status: 'pending' | 'success' | 'error', message: string) => {
        setTestResults(prev => ({
            ...prev,
            [testName]: { status, message }
        }))
    }

    const runComprehensiveTests = async () => {
        if (!account || !provider || !factoryContract || !usdcContract) {
            alert('Please connect your wallet first!')
            return
        }

        setIsRunning(true)
        setTestResults({})

        try {
            // Test 1: Check wallet connection
            updateTest('walletConnection', 'pending', 'Testing wallet connection...')
            const balance = await provider.getBalance(account)
            updateTest('walletConnection', 'success', `Connected! ETH Balance: ${balance.toString()}`)

            // Test 2: Check USDC balance
            updateTest('usdcBalance', 'pending', 'Checking USDC balance...')
            const usdcBalance = await getUSDCBalance(account)
            updateTest('usdcBalance', 'success', `USDC Balance: ${usdcBalance}`)

            // Test 3: Check Factory contract
            updateTest('factoryContract', 'pending', 'Testing Factory contract...')
            const projectCount = await factoryContract.getProjectCount()
            updateTest('factoryContract', 'success', `Factory working! Project count: ${projectCount.toString()}`)

            // Test 4: Check test project escrow
            updateTest('testProject', 'pending', 'Checking test project...')
            const escrowAddress = await getProjectEscrow(1)
            if (escrowAddress === '0x0000000000000000000000000000000000000000') {
                updateTest('testProject', 'error', 'Test project not found!')
            } else {
                updateTest('testProject', 'success', `Test project escrow: ${escrowAddress}`)
            }

            // Test 5: Check project info
            if (escrowAddress !== '0x0000000000000000000000000000000000000000') {
                updateTest('projectInfo', 'pending', 'Getting project info...')
                const projectInfo = await getProjectInfo(escrowAddress)
                if (projectInfo) {
                    updateTest('projectInfo', 'success',
                        `Goal: ${projectInfo.goal} USDC, Funded: ${projectInfo.funded} USDC, Investors: ${projectInfo.investorCount}`
                    )
                } else {
                    updateTest('projectInfo', 'error', 'Could not get project info')
                }
            }

            // Test 6: Check USDC contract functions
            updateTest('usdcContract', 'pending', 'Testing USDC contract...')
            const usdcName = await usdcContract.name()
            const usdcDecimals = await usdcContract.decimals()
            updateTest('usdcContract', 'success', `USDC: ${usdcName}, ${usdcDecimals} decimals`)

            // Test 7: Network check
            updateTest('network', 'pending', 'Checking network...')
            const network = await provider.getNetwork()
            updateTest('network', 'success', `Network: ${network.name} (Chain ID: ${network.chainId})`)

        } catch (error) {
            console.error('Test error:', error)
            updateTest('error', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsRunning(false)
        }
    }

    const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'pending': return '⏳'
            case 'success': return '✅'
            case 'error': return '❌'
        }
    }

    const getStatusColor = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'pending': return 'text-blue-600'
            case 'success': return 'text-green-600'
            case 'error': return 'text-red-600'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🧪 Factory Pattern Test Suite</h2>

            {!account ? (
                <div className="text-center">
                    <button
                        onClick={connectWallet}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Connect Wallet to Start Testing
                    </button>
                </div>
            ) : (
                <div>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Connected Account:</p>
                        <p className="font-mono text-sm">{account}</p>
                    </div>

                    <button
                        onClick={runComprehensiveTests}
                        disabled={isRunning}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {isRunning ? 'Running Tests...' : 'Run Comprehensive Tests'}
                    </button>

                    {Object.keys(testResults).length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
                            {Object.entries(testResults).map(([testName, result]) => (
                                <div key={testName} className="flex items-start space-x-3 p-3 border rounded-lg">
                                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 capitalize">
                                            {testName.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className={`text-sm ${getStatusColor(result.status)}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">💡 Testing Checklist:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>✓ Wallet connection to localhost:8545</li>
                    <li>✓ USDC balance display (should be 1,000,000)</li>
                    <li>✓ Factory contract interaction</li>
                    <li>✓ Test project escrow access</li>
                    <li>✓ Project information retrieval</li>
                    <li>✓ USDC contract functions</li>
                    <li>✓ Network configuration verification</li>
                </ul>
            </div>
        </div>
    )
}
