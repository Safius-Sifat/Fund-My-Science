'use client'

import ComprehensiveTest from '@/components/ComprehensiveTest'
import InvestmentTracker from '@/components/InvestmentTracker'
import ProjectInvestment from '@/components/ProjectInvestment'
import TokenManager from '@/components/TokenManager'
import USDCFaucet from '@/components/USDCFaucet'
import { Web3Provider } from '@/contexts/Web3FactoryContext'

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
                            Test the complete blockchain architecture with USDC investments and project tokens.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 1: Get Test USDC
                            </h2>
                            <USDCFaucet />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 2: Invest in Project
                            </h2>
                            <ProjectInvestment {...demoProject} />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Step 3: System Tests
                            </h2>
                            <ComprehensiveTest />
                        </div>
                    </div>

                    {/* Investment Tracker */}
                    <div className="mb-8">
                        <InvestmentTracker />
                    </div>

                    {/* Token Manager */}
                    <div className="mb-8">
                        <TokenManager />
                    </div>
                </div>
            </div>
        </Web3Provider>
    )
}
