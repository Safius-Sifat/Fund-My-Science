'use client'

import { ethers } from 'ethers'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

// New Factory Pattern ABIs
const FUND_MY_SCIENCE_ABI = [
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
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "investor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "InvestmentMade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "MilestoneApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "evidenceHash",
                "type": "string"
            }
        ],
        "name": "MilestoneCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "Paused",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": true,
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum FundMyScience.ProjectStatus",
                "name": "newStatus",
                "type": "uint8"
            }
        ],
        "name": "ProjectStatusChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "Unpaused",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            }
        ],
        "name": "approveMilestone",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_ipfsHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_fundingGoal",
                "type": "uint256"
            },
            {
                "internalType": "string[]",
                "name": "_milestoneDescriptions",
                "type": "string[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_milestoneFunding",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_milestoneTargets",
                "type": "uint256[]"
            }
        ],
        "name": "createProject",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            }
        ],
        "name": "getProject",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
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
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fundingGoal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fundsRaised",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestoneCount",
                "type": "uint256"
            },
            {
                "internalType": "enum FundMyScience.ProjectStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "createdAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            }
        ],
        "name": "getProjectInvestments",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "investor",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "projectId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct FundMyScience.Investment[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            }
        ],
        "name": "getProjectMilestones",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "projectId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "milestoneIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundingAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "targetDate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum FundMyScience.MilestoneStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "evidenceHash",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "approvedAt",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct FundMyScience.Milestone[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserInvestments",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserProjects",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            }
        ],
        "name": "investInProject",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextProjectId",
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
        "name": "owner",
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
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "paused",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "platformFeePercentage",
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
        "name": "platformWallet",
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "projectInvestments",
        "outputs": [
            {
                "internalType": "address",
                "name": "investor",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "projectMilestones",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fundingAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "targetDate",
                "type": "uint256"
            },
            {
                "internalType": "enum FundMyScience.MilestoneStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "evidenceHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "approvedAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "projects",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
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
                "name": "ipfsHash",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fundingGoal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fundsRaised",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestoneCount",
                "type": "uint256"
            },
            {
                "internalType": "enum FundMyScience.ProjectStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "createdAt",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "evidenceHash",
                "type": "string"
            }
        ],
        "name": "submitMilestoneEvidence",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newFeePercentage",
                "type": "uint256"
            }
        ],
        "name": "updatePlatformFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newWallet",
                "type": "address"
            }
        ],
        "name": "updatePlatformWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userInvestments",
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
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userProjects",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

interface Web3ContextType {
    // Connection state
    isConnected: boolean
    account: string | null
    chainId: number | null
    provider: ethers.BrowserProvider | null
    signer: ethers.JsonRpcSigner | null
    contract: ethers.Contract | null

    // Connection methods
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    switchNetwork: (chainId: number) => Promise<void>

    // Contract methods
    createProjectOnChain: (projectData: CreateProjectData) => Promise<string>
    investInProjectOnChain: (projectId: number, amount: string) => Promise<string>
    submitMilestoneEvidenceOnChain: (projectId: number, milestoneIndex: number, evidenceHash: string) => Promise<string>

    // Data fetching methods
    getProjectFromChain: (projectId: number) => Promise<ProjectData>
    getUserProjectsFromChain: (address: string) => Promise<number[]>
    getUserInvestmentsFromChain: (address: string) => Promise<number[]>

    // Utils
    isCorrectNetwork: boolean
    loading: boolean
    error: string | null
}

interface CreateProjectData {
    title: string
    ipfsHash: string
    fundingGoal: string
    milestoneDescriptions: string[]
    milestoneFunding: string[]
    milestoneTargets: number[]
}

interface ProjectData {
    id: number
    researcher: string
    title: string
    ipfsHash: string
    fundingGoal: string
    fundsRaised: string
    milestoneCount: number
    status: number
    createdAt: number
    milestones: MilestoneData[]
}

interface MilestoneData {
    projectId: number
    milestoneIndex: number
    description: string
    fundingAmount: string
    targetDate: number
    status: number
    evidenceHash: string
    approvedAt: number
}

// Network configuration
const NETWORKS = {
    localhost: {
        chainId: 31337,
        name: 'Localhost',
        rpcUrl: 'http://localhost:8545',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    },
    sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || ''
    }
}

const CURRENT_NETWORK = process.env.NODE_ENV === 'development' ? 'localhost' : 'sepolia'
const TARGET_NETWORK = NETWORKS[CURRENT_NETWORK as keyof typeof NETWORKS]

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3() {
    const context = useContext(Web3Context)
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider')
    }
    return context
}

interface Web3ProviderProps {
    children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [account, setAccount] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
    const [contract, setContract] = useState<ethers.Contract | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isCorrectNetwork = chainId === TARGET_NETWORK.chainId

    const checkConnection = useCallback(async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const web3Provider = new ethers.BrowserProvider(window.ethereum)
                const accounts = await web3Provider.listAccounts()

                if (accounts.length > 0) {
                    const network = await web3Provider.getNetwork()
                    const web3Signer = await web3Provider.getSigner()

                    setProvider(web3Provider)
                    setSigner(web3Signer)
                    setAccount(accounts[0].address)
                    setChainId(Number(network.chainId))
                    setIsConnected(true)
                }
            } catch (err) {
                console.error('Error checking connection:', err)
            }
        }
    }, [])

    const disconnectWallet = useCallback(() => {
        setIsConnected(false)
        setAccount(null)
        setChainId(null)
        setProvider(null)
        setSigner(null)
        setContract(null)
        setError(null)
        console.log('👋 Wallet disconnected')
    }, [])

    const handleAccountsChanged = useCallback((...args: unknown[]) => {
        const accounts = args[0] as string[]
        if (accounts.length === 0) {
            disconnectWallet()
        } else {
            setAccount(accounts[0])
        }
    }, [disconnectWallet])

    const handleChainChanged = useCallback((...args: unknown[]) => {
        const chainId = args[0] as string
        setChainId(parseInt(chainId, 16))
        // Force page reload to ensure clean state
        window.location.reload()
    }, [])

    const setupEventListeners = useCallback(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            window.ethereum.on('chainChanged', handleChainChanged)
        }

        return () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
                window.ethereum.removeListener('chainChanged', handleChainChanged)
            }
        }
    }, [handleAccountsChanged, handleChainChanged])

    const initializeContract = useCallback(() => {
        if (!signer || !TARGET_NETWORK.contractAddress) return

        try {
            console.log('🔧 Initializing contract with ABI length:', FUND_MY_SCIENCE_ABI.length)
            console.log('📍 Contract address:', TARGET_NETWORK.contractAddress)
            console.log('🔗 Network:', TARGET_NETWORK.name)

            const contractInstance = new ethers.Contract(
                TARGET_NETWORK.contractAddress,
                FUND_MY_SCIENCE_ABI,
                signer
            )
            setContract(contractInstance)

            // Test if createProject function exists
            console.log('🧪 Testing contract interface...')
            console.log('📝 createProject function exists:', typeof contractInstance.createProject === 'function')
            console.log('💰 investInProject function exists:', typeof contractInstance.investInProject === 'function')

            console.log('📜 Contract initialized:', TARGET_NETWORK.contractAddress)
        } catch (err) {
            console.error('Error initializing contract:', err)
            setError('Failed to initialize contract')
        }
    }, [signer])

    // Initialize provider and check for existing connection
    useEffect(() => {
        checkConnection()
        setupEventListeners()
    }, [checkConnection, setupEventListeners])

    // Initialize contract when provider and network are ready
    useEffect(() => {
        if (provider && signer && isCorrectNetwork) {
            initializeContract()
        }
    }, [provider, signer, isCorrectNetwork, initializeContract])

    const connectWallet = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            setError('MetaMask is not installed. Please install MetaMask to continue.')
            return
        }

        try {
            setLoading(true)
            setError(null)

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' })

            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            const network = await web3Provider.getNetwork()
            const web3Signer = await web3Provider.getSigner()
            const address = await web3Signer.getAddress()

            setProvider(web3Provider)
            setSigner(web3Signer)
            setAccount(address)
            setChainId(Number(network.chainId))
            setIsConnected(true)

            console.log('✅ Wallet connected:', address)
            console.log('🌐 Network:', network.name, '(Chain ID:', Number(network.chainId), ')')

        } catch (err: unknown) {
            console.error('Error connecting wallet:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const switchNetwork = async (targetChainId: number) => {
        if (!window.ethereum) return

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            })
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 4902) {
                // Network not added to MetaMask
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${targetChainId.toString(16)}`,
                            chainName: TARGET_NETWORK.name,
                            rpcUrls: [TARGET_NETWORK.rpcUrl],
                        }],
                    })
                } catch (addError) {
                    console.error('Error adding network:', addError)
                }
            } else {
                console.error('Error switching network:', err)
            }
        }
    }

    // Contract interaction methods
    const createProjectOnChain = async (projectData: CreateProjectData): Promise<string> => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            setLoading(true)
            console.log('🚀 Creating project on blockchain...', projectData)
            console.log('📋 Function parameters:')
            console.log('  - title:', projectData.title)
            console.log('  - ipfsHash:', projectData.ipfsHash)
            console.log('  - fundingGoal (raw):', projectData.fundingGoal)
            console.log('  - fundingGoal (parsed):', ethers.parseEther(projectData.fundingGoal).toString())
            console.log('  - milestoneDescriptions:', projectData.milestoneDescriptions)
            console.log('  - milestoneFunding (raw):', projectData.milestoneFunding)
            console.log('  - milestoneFunding (parsed):', projectData.milestoneFunding.map(amount => ethers.parseEther(amount).toString()))
            console.log('  - milestoneTargets:', projectData.milestoneTargets)

            // Test if the function exists
            if (typeof contract.createProject !== 'function') {
                throw new Error('createProject function not found on contract')
            }

            console.log('🔧 Contract address:', await contract.getAddress())
            console.log('🔧 Signer address:', await signer?.getAddress())

            // Prepare parameters
            const fundingGoalWei = ethers.parseEther(projectData.fundingGoal)
            const milestoneFundingWei = projectData.milestoneFunding.map(amount => ethers.parseEther(amount))

            console.log('📊 Final parameters for contract call:')
            console.log('  - fundingGoalWei:', fundingGoalWei.toString())
            console.log('  - milestoneFundingWei:', milestoneFundingWei.map(w => w.toString()))

            // Verify milestone funding adds up to total goal
            const totalMilestoneWei = milestoneFundingWei.reduce((sum, amount) => sum + amount, BigInt(0))
            console.log('  - totalMilestoneWei:', totalMilestoneWei.toString())
            console.log('  - funding match:', totalMilestoneWei === fundingGoalWei)

            console.log('📞 Calling contract.createProject...')
            const tx = await contract.createProject(
                projectData.title,
                projectData.ipfsHash,
                fundingGoalWei,
                projectData.milestoneDescriptions,
                milestoneFundingWei,
                projectData.milestoneTargets
            )

            console.log('⏳ Transaction sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Project created on blockchain:', receipt.hash)

            // Extract project ID from the ProjectCreated event
            let blockchainProjectId: number | null = null
            if (receipt.logs) {
                for (const log of receipt.logs) {
                    try {
                        const parsedLog = contract.interface.parseLog(log)
                        if (parsedLog && parsedLog.name === 'ProjectCreated') {
                            blockchainProjectId = Number(parsedLog.args.projectId)
                            console.log('🎯 Blockchain Project ID extracted:', blockchainProjectId)
                            break
                        }
                    } catch {
                        // Skip logs that can't be parsed by this contract
                        continue
                    }
                }
            }

            if (blockchainProjectId === null) {
                console.warn('⚠️ Could not extract project ID from transaction receipt')
            }

            // Return both transaction hash and project ID as a JSON string
            return JSON.stringify({
                transactionHash: receipt.hash,
                blockchainProjectId: blockchainProjectId
            })
        } catch (err: unknown) {
            console.error('❌ Error creating project on blockchain:', err)
            if (err instanceof Error) {
                console.error('❌ Error details:', {
                    message: err.message,
                    stack: err.stack,
                    name: err.name
                })
            }
            const errorMessage = err instanceof Error ? (err.message || 'Failed to create project on blockchain') : 'Failed to create project on blockchain'
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const investInProjectOnChain = async (projectId: number, amount: string): Promise<string> => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            setLoading(true)
            console.log(`💰 Investing ${amount} ETH in project ${projectId}...`)

            const tx = await contract.investInProject(projectId, {
                value: ethers.parseEther(amount)
            })

            console.log('⏳ Investment transaction sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Investment completed:', receipt.hash)

            return receipt.hash
        } catch (err: unknown) {
            console.error('❌ Error investing in project:', err)
            const errorMessage = err instanceof Error ? (err.message || 'Failed to invest in project') : 'Failed to invest in project'
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const submitMilestoneEvidenceOnChain = async (
        projectId: number,
        milestoneIndex: number,
        evidenceHash: string
    ): Promise<string> => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            setLoading(true)
            console.log(`📋 Submitting milestone evidence for project ${projectId}, milestone ${milestoneIndex}...`)

            const tx = await contract.submitMilestoneEvidence(projectId, milestoneIndex, evidenceHash)

            console.log('⏳ Evidence submission transaction sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Milestone evidence submitted:', receipt.hash)

            return receipt.hash
        } catch (err: unknown) {
            console.error('❌ Error submitting milestone evidence:', err)
            const errorMessage = err instanceof Error ? (err.message || 'Failed to submit milestone evidence') : 'Failed to submit milestone evidence'
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getProjectFromChain = async (projectId: number) => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            const projectData = await contract.getProject(projectId)
            const milestones = await contract.getProjectMilestones(projectId)

            return {
                id: Number(projectData[0]),
                researcher: projectData[1],
                title: projectData[2],
                ipfsHash: projectData[3],
                fundingGoal: ethers.formatEther(projectData[4]),
                fundsRaised: ethers.formatEther(projectData[5]),
                milestoneCount: Number(projectData[6]),
                status: Number(projectData[7]),
                createdAt: Number(projectData[8]),
                milestones: milestones.map((m: unknown[]) => ({
                    projectId: Number(m[0]),
                    milestoneIndex: Number(m[1]),
                    description: m[2] as string,
                    fundingAmount: ethers.formatEther(m[3] as bigint),
                    targetDate: Number(m[4]),
                    status: Number(m[5]),
                    evidenceHash: m[6] as string,
                    approvedAt: Number(m[7])
                }))
            }
        } catch (err) {
            console.error('Error fetching project from chain:', err)
            throw err
        }
    }

    const getUserProjectsFromChain = async (address: string): Promise<number[]> => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            const projectIds = await contract.getUserProjects(address)
            return projectIds.map((id: bigint) => Number(id))
        } catch (err) {
            console.error('Error fetching user projects from chain:', err)
            throw err
        }
    }

    const getUserInvestmentsFromChain = async (address: string): Promise<number[]> => {
        if (!contract) throw new Error('Contract not initialized')

        try {
            const investmentIds = await contract.getUserInvestments(address)
            return investmentIds.map((id: bigint) => Number(id))
        } catch (err) {
            console.error('Error fetching user investments from chain:', err)
            throw err
        }
    }

    const value = {
        // Connection state
        isConnected,
        account,
        chainId,
        provider,
        signer,
        contract,

        // Connection methods
        connectWallet,
        disconnectWallet,
        switchNetwork,

        // Contract methods
        createProjectOnChain,
        investInProjectOnChain,
        submitMilestoneEvidenceOnChain,

        // Data fetching methods
        getProjectFromChain,
        getUserProjectsFromChain,
        getUserInvestmentsFromChain,

        // Utils
        isCorrectNetwork,
        loading,
        error
    }

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    )
}

// Types for window.ethereum
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
            on: (event: string, callback: (...args: unknown[]) => void) => void
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void
        }
    }
}
