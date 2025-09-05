'use client'

import ComprehensiveTest from '@/components/ComprehensiveTest'
import ProjectInvestment from '@/components/ProjectInvestment'
import USDCFaucet from '@/components/USDCFaucet'
import { Web3Provider } from '@/contexts/Web3FactoryContext'

// Demo data for testing
const demoProject = {
    projectId: 1,
    projectTitle: "Quantum Computing Research Initiative",
    fundingGoal: "10000",
    currentFunding: "0",
    researcherAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}

export default function BlockchainDemo() {
    return (
        <Web3Provider>
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            🔗 Fund My Science - Factory Pattern Demo
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Experience the new blockchain architecture with USDC investments,
                            project tokens, and secure escrow contracts.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-8">
                        {/* USDC Faucet */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 1: Get Test USDC
                            </h2>
                            <USDCFaucet />
                        </div>

                        {/* Project Investment */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 2: Invest in Project
                            </h2>
                            <ProjectInvestment {...demoProject} />
                        </div>

                        {/* Comprehensive Test Suite */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 3: System Tests
                            </h2>
                            <ComprehensiveTest />
                        </div>
                    </div>

                    {/* Architecture Overview */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            🏗️ Factory Pattern Architecture
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-800 mb-2">
                                    🏭 ProjectFactory
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Master contract that creates and manages individual project escrows.
                                    Only DAO can create new projects.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-800 mb-2">
                                    🏦 ProjectEscrow
                                </h3>
                                <p className="text-sm text-green-700">
                                    Individual escrow contract for each project. Handles USDC investments,
                                    milestone releases, and platform fees.
                                </p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-800 mb-2">
                                    🪙 ProjectToken
                                </h3>
                                <p className="text-sm text-purple-700">
                                    ERC-20 tokens representing shares in specific projects.
                                    Minted when investors fund projects.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Testing Instructions */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            🧪 Testing Instructions
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-800 mb-3">📋 Prerequisites:</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        MetaMask configured for localhost:8545
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Import test account private key
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Chain ID: 31337
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-800 mb-3">🔑 Test Account:</h3>
                                <div className="bg-gray-50 p-3 rounded text-xs font-mono break-all">
                                    <p className="text-gray-600 mb-1">Private Key:</p>
                                    <p>0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</p>
                                    <p className="text-gray-600 mb-1 mt-2">Address:</p>
                                    <p>0xf39Fd...f2ff80</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• This is a local test environment with test tokens</li>
                                <li>• Make sure Hardhat node is running on port 8545</li>
                                <li>• All transactions are on the local blockchain</li>
                                <li>• Test USDC has no real value</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Web3Provider>
    )
}
