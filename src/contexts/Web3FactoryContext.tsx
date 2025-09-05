'use client'

import { ethers } from 'ethers'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

// New Factory Pattern ABIs
const PROJECT_FACTORY_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_usdcToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_daoAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_platformWallet",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "databaseProjectId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "escrowAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "researcher",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fundingGoal",
                "type": "uint256"
            }
        ],
        "name": "ProjectCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "databaseProjectId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "researcher",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fundingGoal",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "milestoneAmounts",
                "type": "uint256[]"
            },
            {
                "internalType": "string[]",
                "name": "milestoneDescriptions",
                "type": "string[]"
            }
        ],
        "name": "createProject",
        "outputs": [
            {
                "internalType": "address",
                "name": "escrowAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "databaseProjectId",
                "type": "uint256"
            }
        ],
        "name": "getProjectEscrow",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProjectCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllProjectIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const PROJECT_ESCROW_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "investor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "usdcAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokensReceived",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalFunded",
                "type": "uint256"
            }
        ],
        "name": "InvestmentReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "platformFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "researcherAmount",
                "type": "uint256"
            }
        ],
        "name": "MilestoneReleased",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "fund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            }
        ],
        "name": "releaseMilestone",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProjectInfo",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "researcherAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "goal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "funded",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "remaining",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "investorCount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "completed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "milestonesTotal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestonesReleasedCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "investor",
                "type": "address"
            }
        ],
        "name": "getInvestorInfo",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalContribution",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tokenBalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sharePercentage",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const USDC_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // Mock USDC specific functions
    {
        "inputs": [],
        "name": "faucet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

// Contract addresses (will be set from environment or deployment)
const CONTRACT_ADDRESSES = {
    PROJECT_FACTORY: process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    USDC_TOKEN: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
}

interface Web3ContextType {
    // Connection state
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    account: string | null
    chainId: number | null
    isConnecting: boolean

    // Contracts
    factoryContract: ethers.Contract | null
    usdcContract: ethers.Contract | null

    // Functions
    connectWallet: () => Promise<void>
    disconnectWallet: () => void

    // Factory functions
    createProjectOnChain: (projectData: ProjectCreationData) => Promise<{
        success: boolean
        transactionHash?: string
        escrowAddress?: string
        error?: string
    }>

    // Investment functions
    investInProject: (projectId: number, amount: string) => Promise<{
        success: boolean
        transactionHash?: string
        error?: string
    }>

    // Utility functions
    getProjectEscrow: (projectId: number) => Promise<string>
    getProjectInfo: (escrowAddress: string) => Promise<ProjectInfo | null>
    getUSDCBalance: (address: string) => Promise<string>
    approveUSDC: (spender: string, amount: string) => Promise<string>
    getUSDCAllowance: (owner: string, spender: string) => Promise<string>
}

interface ProjectCreationData {
    databaseProjectId: number
    researcher: string
    title: string
    symbol: string
    fundingGoal: string // In USDC (with decimals)
    milestoneAmounts: string[]
    milestoneDescriptions: string[]
}

interface ProjectInfo {
    projectId: number
    researcherAddress: string
    goal: string
    funded: string
    remaining: string
    investorCount: number
    completed: boolean
    milestonesTotal: number
    milestonesReleased: number
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [account, setAccount] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [factoryContract, setFactoryContract] = useState<ethers.Contract | null>(null)
    const [usdcContract, setUsdcContract] = useState<ethers.Contract | null>(null)

    // Initialize contracts when provider is available
    useEffect(() => {
        if (provider && signer) {
            const factory = new ethers.Contract(
                CONTRACT_ADDRESSES.PROJECT_FACTORY,
                PROJECT_FACTORY_ABI,
                signer
            )
            const usdc = new ethers.Contract(
                CONTRACT_ADDRESSES.USDC_TOKEN,
                USDC_ABI,
                signer
            )

            setFactoryContract(factory)
            setUsdcContract(usdc)
        } else {
            setFactoryContract(null)
            setUsdcContract(null)
        }
    }, [provider, signer])

    const connectWallet = useCallback(async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask is not installed')
        }

        setIsConnecting(true)
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' })

            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            const web3Signer = await web3Provider.getSigner()
            const address = await web3Signer.getAddress()
            const network = await web3Provider.getNetwork()

            setProvider(web3Provider)
            setSigner(web3Signer)
            setAccount(address)
            setChainId(Number(network.chainId))

            console.log('🔗 Wallet connected:', address)
            console.log('🌐 Network:', network.name, network.chainId)
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            throw error
        } finally {
            setIsConnecting(false)
        }
    }, [])

    const disconnectWallet = useCallback(() => {
        setProvider(null)
        setSigner(null)
        setAccount(null)
        setChainId(null)
        setFactoryContract(null)
        setUsdcContract(null)
        console.log('🔌 Wallet disconnected')
    }, [])

    // Check if wallet is already connected
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                    if (accounts.length > 0) {
                        await connectWallet()
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error)
                }
            }
        }
        checkConnection()
    }, [connectWallet])

    const createProjectOnChain = useCallback(async (projectData: ProjectCreationData) => {
        if (!factoryContract || !signer) {
            return { success: false, error: 'Wallet not connected' }
        }

        try {
            console.log('🚀 Creating project on blockchain:', projectData)

            // Convert amounts to proper format (USDC has 6 decimals)
            const fundingGoalWei = ethers.parseUnits(projectData.fundingGoal, 6)
            const milestoneAmountsWei = projectData.milestoneAmounts.map(amount =>
                ethers.parseUnits(amount, 6)
            )

            const tx = await factoryContract.createProject(
                projectData.databaseProjectId,
                projectData.researcher,
                projectData.title,
                projectData.symbol,
                fundingGoalWei,
                milestoneAmountsWei,
                projectData.milestoneDescriptions
            )

            console.log('📤 Transaction sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Transaction confirmed:', receipt)

            // Extract escrow address from events
            let escrowAddress = ''
            if (receipt.logs) {
                const projectCreatedEvent = receipt.logs.find((log: ethers.EventLog) =>
                    log.fragment?.name === 'ProjectCreated'
                )
                if (projectCreatedEvent && projectCreatedEvent instanceof ethers.EventLog) {
                    escrowAddress = projectCreatedEvent.args.escrowAddress
                    console.log('🏦 Escrow address:', escrowAddress)
                }
            }

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                escrowAddress
            }
        } catch (error: unknown) {
            console.error('❌ Failed to create project:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create project on blockchain'
            }
        }
    }, [factoryContract, signer])

    const investInProject = useCallback(async (projectId: number, amount: string) => {
        if (!factoryContract || !usdcContract || !signer || !account) {
            return { success: false, error: 'Wallet not connected' }
        }

        try {
            console.log('💰 Investing in project:', projectId, 'Amount:', amount)

            // Get escrow address
            const escrowAddress = await factoryContract.getProjectEscrow(projectId)
            if (escrowAddress === ethers.ZeroAddress) {
                return { success: false, error: 'Project not found on blockchain' }
            }

            // Create escrow contract instance
            const escrowContract = new ethers.Contract(escrowAddress, PROJECT_ESCROW_ABI, signer)

            // Convert amount to USDC format (6 decimals)
            const amountWei = ethers.parseUnits(amount, 6)

            // Step 1: Approve USDC spending
            console.log('📝 Approving USDC spending...')
            const approveTx = await usdcContract.approve(escrowAddress, amountWei)
            await approveTx.wait()
            console.log('✅ USDC approval confirmed')

            // Step 2: Fund the project
            console.log('💸 Funding project...')
            const fundTx = await escrowContract.fund(amountWei)
            const receipt = await fundTx.wait()
            console.log('✅ Investment confirmed:', receipt.transactionHash)

            return {
                success: true,
                transactionHash: receipt.transactionHash
            }
        } catch (error: unknown) {
            console.error('❌ Failed to invest:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to invest in project'
            }
        }
    }, [factoryContract, usdcContract, signer, account])

    const getProjectEscrow = useCallback(async (projectId: number): Promise<string> => {
        if (!factoryContract) return ''

        try {
            return await factoryContract.getProjectEscrow(projectId)
        } catch (error) {
            console.error('Failed to get project escrow:', error)
            return ''
        }
    }, [factoryContract])

    const getProjectInfo = useCallback(async (escrowAddress: string): Promise<ProjectInfo | null> => {
        if (!provider || !escrowAddress || escrowAddress === ethers.ZeroAddress) {
            return null
        }

        try {
            const escrowContract = new ethers.Contract(escrowAddress, PROJECT_ESCROW_ABI, provider)
            const info = await escrowContract.getProjectInfo()

            return {
                projectId: Number(info.projectId),
                researcherAddress: info.researcherAddress,
                goal: ethers.formatUnits(info.goal, 6),
                funded: ethers.formatUnits(info.funded, 6),
                remaining: ethers.formatUnits(info.remaining, 6),
                investorCount: Number(info.investorCount),
                completed: info.completed,
                milestonesTotal: Number(info.milestonesTotal),
                milestonesReleased: Number(info.milestonesReleasedCount)
            }
        } catch (error) {
            console.error('Failed to get project info:', error)
            return null
        }
    }, [provider])

    const getUSDCBalance = useCallback(async (address: string): Promise<string> => {
        if (!usdcContract) return '0'

        try {
            const balance = await usdcContract.balanceOf(address)
            return ethers.formatUnits(balance, 6)
        } catch (error) {
            console.error('Failed to get USDC balance:', error)
            return '0'
        }
    }, [usdcContract])

    const approveUSDC = useCallback(async (spender: string, amount: string): Promise<string> => {
        if (!usdcContract || !signer) {
            throw new Error('Wallet not connected')
        }

        try {
            const amountWei = ethers.parseUnits(amount, 6)
            const tx = await usdcContract.approve(spender, amountWei)
            const receipt = await tx.wait()
            return receipt.hash
        } catch (error: unknown) {
            console.error('Failed to approve USDC:', error)
            throw new Error(error instanceof Error ? error.message : 'Failed to approve USDC')
        }
    }, [usdcContract, signer])

    const getUSDCAllowance = useCallback(async (owner: string, spender: string): Promise<string> => {
        if (!usdcContract) return '0'

        try {
            const allowance = await usdcContract.allowance(owner, spender)
            return ethers.formatUnits(allowance, 6)
        } catch (error) {
            console.error('Failed to get USDC allowance:', error)
            return '0'
        }
    }, [usdcContract])

    const value: Web3ContextType = {
        provider,
        signer,
        account,
        chainId,
        isConnecting,
        factoryContract,
        usdcContract,
        connectWallet,
        disconnectWallet,
        createProjectOnChain,
        investInProject,
        getProjectEscrow,
        getProjectInfo,
        getUSDCBalance,
        approveUSDC,
        getUSDCAllowance
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
    const context = useContext(Web3Context)
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider')
    }
    return context
}

export type { ProjectCreationData, ProjectInfo, Web3ContextType }

