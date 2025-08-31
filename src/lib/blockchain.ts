'use client'

import { supabase } from '@/lib/supabase'

/**
 * Blockchain Integration Utilities
 * Manages the sync between Supabase database and blockchain
 */

interface Web3ContextType {
    provider?: {
        getFeeData: () => Promise<{ gasPrice: bigint | null }>
        getTransactionReceipt: (hash: string) => Promise<{ status: number; blockNumber: number } | null>
    }
    contract?: {
        createProject: {
            estimateGas: (...args: unknown[]) => Promise<bigint>
        }
        investInProject: {
            estimateGas: (...args: unknown[]) => Promise<bigint>
        }
        submitMilestoneEvidence: {
            estimateGas: (...args: unknown[]) => Promise<bigint>
        }
        on: (event: string, callback: (...args: unknown[]) => void) => void
        removeAllListeners: () => void
    }
    createProjectOnChain?: (data: BlockchainProject) => Promise<string>
    investInProjectOnChain?: (projectId: number, amount: string) => Promise<string>
    account?: string | null
}

export interface BlockchainProject {
    id: number
    title: string
    ipfsHash: string
    fundingGoal: string
    milestoneDescriptions: string[]
    milestoneFunding: string[]
    milestoneTargets: number[]
}

export interface BlockchainInvestment {
    projectId: number
    amount: string
    transactionHash: string
}

interface MilestoneData {
    description: string
    funding_amount: number
    target_date: string
}

/**
 * Sync project creation to blockchain
 */
export async function syncProjectToBlockchain(
    projectId: number,
    web3Context: {
        createProjectOnChain: (data: BlockchainProject) => Promise<string>
        account: string | null
    }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
        console.log('🔄 Syncing project to blockchain...', projectId)
        console.log('🔍 Web3Context:', {
            hasCreateFunction: typeof web3Context.createProjectOnChain === 'function',
            account: web3Context.account
        })

        // Fetch project data from Supabase
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
        *,
        milestones (*)
      `)
            .eq('id', projectId)
            .single()

        if (projectError || !project) {
            throw new Error('Failed to fetch project data')
        }

        console.log('📊 Project data fetched:', {
            id: project.id,
            title: project.title,
            funding_goal: project.funding_goal,
            milestones_count: project.milestones?.length || 0
        })

        // Check if project has milestones
        if (!project.milestones || project.milestones.length === 0) {
            throw new Error('Project must have at least one milestone to deploy to blockchain')
        }

        // Convert USD to ETH (simplified conversion - in production you'd use real exchange rates)
        const USD_TO_ETH = 0.0004 // Example: $1 = 0.0004 ETH (adjust as needed)
        const fundingGoalETH = (project.funding_goal * USD_TO_ETH).toFixed(4)

        // Prepare blockchain data with default milestones if none exist
        let milestones = project.milestones || []

        // If no milestones exist, create default ones
        if (milestones.length === 0) {
            console.log('⚠️ No milestones found, creating default milestones...')
            const defaultMilestoneAmount = Math.floor(project.funding_goal / 3) // Split into 3 equal parts
            const remainder = project.funding_goal - (defaultMilestoneAmount * 2)

            milestones = [
                {
                    description: 'Project Setup and Initial Research',
                    funding_amount: defaultMilestoneAmount,
                    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                },
                {
                    description: 'Development and Implementation',
                    funding_amount: defaultMilestoneAmount,
                    target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
                },
                {
                    description: 'Final Testing and Documentation',
                    funding_amount: remainder,
                    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
                }
            ]
        }

        const blockchainData: BlockchainProject = {
            id: project.id,
            title: project.title,
            ipfsHash: project.ipfs_hash || `project-${project.id}`, // Placeholder for IPFS
            fundingGoal: fundingGoalETH, // Use ETH amount
            milestoneDescriptions: milestones.map((m: MilestoneData) => m.description),
            milestoneFunding: milestones.map((m: MilestoneData) => (m.funding_amount * USD_TO_ETH).toFixed(4)),
            milestoneTargets: milestones.map((m: MilestoneData) =>
                Math.floor(new Date(m.target_date).getTime() / 1000)
            )
        }        // Validate that milestone funding adds up to total goal (approximately)
        const totalMilestoneFunding = blockchainData.milestoneFunding.reduce((sum, amount) => sum + parseFloat(amount), 0)
        const goalAmount = parseFloat(blockchainData.fundingGoal)
        if (Math.abs(totalMilestoneFunding - goalAmount) > 0.001) {
            console.warn('⚠️ Milestone funding does not match total goal, adjusting...')
            // Adjust the last milestone to match the total
            const lastIndex = blockchainData.milestoneFunding.length - 1
            const adjustment = goalAmount - (totalMilestoneFunding - parseFloat(blockchainData.milestoneFunding[lastIndex]))
            blockchainData.milestoneFunding[lastIndex] = adjustment.toFixed(4)
        }

        console.log('📊 Blockchain data prepared:', blockchainData)

        // Create project on blockchain
        const resultString = await web3Context.createProjectOnChain(blockchainData)
        
        // Parse the result to get both transaction hash and blockchain project ID
        let transactionHash: string
        let blockchainProjectId: number | null = null
        
        try {
            const result = JSON.parse(resultString)
            transactionHash = result.transactionHash
            blockchainProjectId = result.blockchainProjectId
            console.log('🎯 Parsed blockchain result:', { transactionHash, blockchainProjectId })
        } catch {
            // Fallback for old format (just transaction hash)
            console.warn('⚠️ Using fallback parsing - old format detected')
            transactionHash = resultString
        }

        // Update Supabase with blockchain info
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                blockchain_project_id: blockchainProjectId, // Use actual blockchain ID
                blockchain_tx_hash: transactionHash,
                blockchain_status: 'synced'
            })
            .eq('id', projectId)

        if (updateError) {
            console.error('Failed to update project with blockchain info:', updateError)
        }

        console.log('✅ Project synced to blockchain:', { transactionHash, blockchainProjectId })
        return { success: true, transactionHash }

    } catch (error: unknown) {
        console.error('❌ Failed to sync project to blockchain:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return { success: false, error: errorMessage }
    }
}

/**
 * Sync investment to blockchain
 */
export async function syncInvestmentToBlockchain(
    investmentData: BlockchainInvestment,
    web3Context: {
        investInProjectOnChain: (projectId: number, amount: string) => Promise<string>
        account: string | null
    }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
        console.log('🔄 Syncing investment to blockchain...', investmentData)

        // Invest on blockchain
        const transactionHash = await web3Context.investInProjectOnChain(
            investmentData.projectId,
            investmentData.amount
        )

        // Record investment in Supabase
        const { error: insertError } = await supabase
            .from('investments')
            .insert({
                project_id: investmentData.projectId,
                investor_id: web3Context.account,
                amount: parseFloat(investmentData.amount),
                transaction_hash: transactionHash,
                blockchain_status: 'confirmed'
            })

        if (insertError) {
            console.error('Failed to record investment in database:', insertError)
        }

        // Update project funds raised
        const { error: updateError } = await supabase.rpc('update_project_funding', {
            project_id: investmentData.projectId,
            investment_amount: parseFloat(investmentData.amount)
        })

        if (updateError) {
            console.error('Failed to update project funding:', updateError)
        }

        console.log('✅ Investment synced to blockchain:', transactionHash)
        return { success: true, transactionHash }

    } catch (error: unknown) {
        console.error('❌ Failed to sync investment to blockchain:', error)
        let errorMessage = 'Unknown error occurred'

        if (error instanceof Error) {
            if (error.message.includes('Researchers cannot invest in their own projects')) {
                errorMessage = 'You cannot invest in your own project'
            } else {
                errorMessage = error.message
            }
        }

        return { success: false, error: errorMessage }
    }
}

/**
 * Check project synchronization status
 */
export async function checkProjectSyncStatus(projectId: number): Promise<{
    isSynced: boolean
    blockchainProjectId?: number
    transactionHash?: string
}> {
    try {
        const { data: project, error } = await supabase
            .from('projects')
            .select('blockchain_project_id, blockchain_tx_hash, blockchain_status')
            .eq('id', projectId)
            .single()

        if (error || !project) {
            return { isSynced: false }
        }

        return {
            isSynced: project.blockchain_status === 'synced',
            blockchainProjectId: project.blockchain_project_id,
            transactionHash: project.blockchain_tx_hash
        }
    } catch (error) {
        console.error('Error checking sync status:', error)
        return { isSynced: false }
    }
}

/**
 * Estimate gas costs for operations
 */
export async function estimateGasCosts(
    web3Context: Web3ContextType,
    operation: 'createProject' | 'invest' | 'submitEvidence',
    params?: Record<string, unknown>
): Promise<{ estimatedGas: string; estimatedCost: string }> {
    try {
        if (!web3Context.provider || !web3Context.contract) {
            throw new Error('Web3 not initialized')
        }

        if (!params) {
            throw new Error('Parameters are required for gas estimation')
        }

        let estimatedGas: bigint

        switch (operation) {
            case 'createProject':
                estimatedGas = await web3Context.contract.createProject.estimateGas(
                    params.title,
                    params.ipfsHash,
                    params.fundingGoal,
                    params.milestoneDescriptions,
                    params.milestoneFunding,
                    params.milestoneTargets
                )
                break
            case 'invest':
                estimatedGas = await web3Context.contract.investInProject.estimateGas(
                    params.projectId,
                    { value: params.amount }
                )
                break
            case 'submitEvidence':
                estimatedGas = await web3Context.contract.submitMilestoneEvidence.estimateGas(
                    params.projectId,
                    params.milestoneIndex,
                    params.evidenceHash
                )
                break
            default:
                throw new Error('Unknown operation')
        }

        const gasPrice = await web3Context.provider.getFeeData()
        const estimatedCost = estimatedGas * (gasPrice.gasPrice || BigInt(0))

        return {
            estimatedGas: estimatedGas.toString(),
            estimatedCost: estimatedCost.toString()
        }

    } catch (error) {
        console.error('Error estimating gas:', error)
        return {
            estimatedGas: '0',
            estimatedCost: '0'
        }
    }
}

/**
 * Watch for blockchain events and sync to database
 */
export function startEventWatcher(web3Context: Web3ContextType) {
    if (!web3Context.contract) return

    console.log('👁️ Starting blockchain event watcher...')

    // Listen for project creation events
    web3Context.contract.on('ProjectCreated', async (...args: unknown[]) => {
        const [projectId, researcher, title, fundingGoal] = args as [number, string, string, bigint]
        console.log('📅 ProjectCreated event:', { projectId, researcher, title, fundingGoal: fundingGoal.toString() })

        // Update database with confirmed blockchain data
        await supabase
            .from('projects')
            .update({ blockchain_status: 'confirmed' })
            .eq('blockchain_project_id', projectId)
    })

    // Listen for investment events
    web3Context.contract.on('InvestmentMade', async (...args: unknown[]) => {
        const [projectId, investor, amount] = args as [number, string, bigint]
        console.log('💰 InvestmentMade event:', { projectId, investor, amount: amount.toString() })

        // Update investment status in database
        await supabase
            .from('investments')
            .update({ blockchain_status: 'confirmed' })
            .eq('project_id', projectId)
            .eq('investor_id', investor)
            .eq('amount', parseFloat(amount.toString()))
    })

    // Listen for milestone events
    web3Context.contract.on('MilestoneCompleted', async (...args: unknown[]) => {
        const [projectId, milestoneIndex, evidenceHash] = args as [number, number, string]
        console.log('✅ MilestoneCompleted event:', { projectId, milestoneIndex, evidenceHash })

        // Update milestone status in database
        await supabase
            .from('milestones')
            .update({
                status: 'in_review',
                verification_evidence_url: evidenceHash
            })
            .eq('project_id', projectId)
            .order('created_at')
            .range(milestoneIndex, milestoneIndex)
    })

    return () => {
        console.log('🔌 Stopping blockchain event watcher...')
        if (web3Context.contract) {
            web3Context.contract.removeAllListeners()
        }
    }
}

/**
 * Get blockchain transaction status
 */
export async function getTransactionStatus(
    transactionHash: string,
    web3Context: Web3ContextType
): Promise<{ status: 'pending' | 'confirmed' | 'failed'; blockNumber?: number }> {
    try {
        if (!web3Context.provider) {
            throw new Error('Web3 provider not available')
        }

        const receipt = await web3Context.provider.getTransactionReceipt(transactionHash)

        if (!receipt) {
            return { status: 'pending' }
        }

        if (receipt.status === 1) {
            return { status: 'confirmed', blockNumber: receipt.blockNumber }
        } else {
            return { status: 'failed', blockNumber: receipt.blockNumber }
        }

    } catch (error) {
        console.error('Error checking transaction status:', error)
        return { status: 'failed' }
    }
}
