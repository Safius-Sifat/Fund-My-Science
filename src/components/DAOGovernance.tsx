'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useWeb3 } from '@/contexts/Web3Context'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface Proposal {
    id: number
    project_id: number
    proposal_document_url: string | null
    dao_status: 'pending_vote' | 'approved' | 'rejected'
    created_at: string
    project: {
        id: number
        title: string
        summary: string
        funding_goal: number
        status: string
        researcher_id: string
        researcher?: {
            id: string
            full_name: string
        }
        university?: {
            name: string
        }
    }
    votes?: {
        id: number
        vote: 'approve' | 'reject'
        validator_id: string
        comments: string | null
        validator?: {
            full_name: string
        }
    }[]
}

export default function DAOGovernance() {
    const { user, profile } = useAuth()
    const web3 = useWeb3()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [votingStates, setVotingStates] = useState<{ [key: number]: boolean }>({})
    const [voteComments, setVoteComments] = useState<{ [key: number]: string }>({})

    useEffect(() => {
        fetchProposals()
    }, [])

    const fetchProposals = async () => {
        const { data, error } = await supabase
            .from('proposals')
            .select(`
                *,
                project:projects!inner (
                    id,
                    title,
                    summary,
                    funding_goal,
                    status,
                    researcher_id,
                    researcher:profiles!projects_researcher_id_fkey (
                        id,
                        full_name
                    ),
                    university:universities (
                        name
                    )
                ),
                votes:dao_votes (
                    id,
                    vote,
                    validator_id,
                    comments,
                    validator:profiles!dao_votes_validator_id_fkey (
                        full_name
                    )
                )
            `)
            .eq('project.status', 'pending_approval')
            .eq('dao_status', 'pending_vote')
            .order('created_at', { ascending: false })

        if (data) {
            setProposals(data as Proposal[])
        }
        if (error) {
            console.error('Error fetching proposals:', error)
        }
        setLoading(false)
    }

    const submitVote = async (proposalId: number, vote: 'approve' | 'reject') => {
        if (!user || profile?.user_role !== 'validator') return

        setVotingStates(prev => ({ ...prev, [proposalId]: true }))

        try {
            // Submit vote
            const { error: voteError } = await supabase
                .from('dao_votes')
                .insert({
                    proposal_id: proposalId,
                    validator_id: user.id,
                    vote,
                    comments: voteComments[proposalId] || null
                })

            if (voteError) throw voteError

            // Check if we should update proposal status
            const { data: votes } = await supabase
                .from('dao_votes')
                .select('vote')
                .eq('proposal_id', proposalId)

            if (votes) {
                const approves = votes.filter(v => v.vote === 'approve').length
                const rejects = votes.filter(v => v.vote === 'reject').length
                const total = votes.length

                let newStatus: 'pending_vote' | 'approved' | 'rejected' = 'pending_vote'

                // Simplified voting rule - 1 vote required
                if (total >= 1) { // Minimum 1 vote required
                    if (approves > rejects) {
                        newStatus = 'approved'
                        // Sync approved project to blockchain
                        await handleBlockchainSync(proposalId)
                    } else if (rejects > approves) {
                        newStatus = 'rejected'
                        // Update project status for rejected projects
                        const proposal = proposals.find(p => p.id === proposalId)
                        if (proposal) {
                            await supabase
                                .from('projects')
                                .update({ status: 'rejected' })
                                .eq('id', proposal.project_id)
                        }
                    }
                }

                // Update proposal status if needed
                if (newStatus !== 'pending_vote') {
                    await supabase
                        .from('proposals')
                        .update({ dao_status: newStatus })
                        .eq('id', proposalId)
                }
            }

            // Refresh proposals
            await fetchProposals()

            // Clear comment
            setVoteComments(prev => ({ ...prev, [proposalId]: '' }))

        } catch (error) {
            console.error('Error submitting vote:', error)
            alert('Failed to submit vote')
        } finally {
            setVotingStates(prev => ({ ...prev, [proposalId]: false }))
        }
    }

    const handleBlockchainSync = async (proposalId: number) => {
        try {
            const proposal = proposals.find(p => p.id === proposalId)
            if (!proposal) return

            console.log('🚀 Processing approved project...', proposal.project_id)

            // First, update project status to active (regardless of blockchain)
            await supabase
                .from('projects')
                .update({
                    status: 'active',
                    blockchain_status: 'pending'
                })
                .eq('id', proposal.project_id)

            // Try blockchain sync if wallet connected
            if (web3.account && web3.contract) {
                console.log('� Syncing approved project to blockchain...', proposal.project_id)

                // Import the blockchain sync function
                const { syncProjectToBlockchain } = await import('@/lib/blockchain')
                const result = await syncProjectToBlockchain(proposal.project_id, web3)

                if (result.success) {
                    console.log('✅ Project synced to blockchain:', result.transactionHash)

                    // Update blockchain status to synced
                    await supabase
                        .from('projects')
                        .update({
                            blockchain_status: 'synced',
                            blockchain_tx_hash: result.transactionHash
                        })
                        .eq('id', proposal.project_id)
                } else {
                    console.warn('⚠️ Blockchain sync failed:', result.error)

                    // Update blockchain status to failed but keep project active
                    await supabase
                        .from('projects')
                        .update({ blockchain_status: 'failed' })
                        .eq('id', proposal.project_id)
                }
            } else {
                console.log('ℹ️ No wallet connected - project active but not synced to blockchain')

                // Update blockchain status to indicate no wallet
                await supabase
                    .from('projects')
                    .update({ blockchain_status: 'no_wallet' })
                    .eq('id', proposal.project_id)
            }
        } catch (error) {
            console.error('Error syncing to blockchain:', error)

            // Ensure project is still active even if blockchain sync fails
            const proposal = proposals.find(p => p.id === proposalId)
            if (proposal) {
                await supabase
                    .from('projects')
                    .update({
                        status: 'active',
                        blockchain_status: 'failed'
                    })
                    .eq('id', proposal.project_id)
            }
        }

        // Refresh proposals to show updated status
        console.log('🔄 Refreshing proposals list...')
        await fetchProposals()
    }

    const getUserVote = (proposal: Proposal) => {
        return proposal.votes?.find(vote => vote.validator_id === user?.id)
    }

    const getVoteCounts = (proposal: Proposal) => {
        const votes = proposal.votes || []
        const approves = votes.filter(v => v.vote === 'approve').length
        const rejects = votes.filter(v => v.vote === 'reject').length
        return { approves, rejects, total: votes.length }
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-lg shadow p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (profile?.user_role !== 'validator') {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-medium text-yellow-800 mb-2">
                        Validator Access Required
                    </h2>
                    <p className="text-yellow-700">
                        Only approved validators can participate in DAO governance.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">DAO Governance</h1>
                <p className="mt-2 text-gray-600">
                    Review and vote on research project proposals
                </p>
                {web3.account && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            🔗 Wallet Connected: {web3.account.slice(0, 8)}...{web3.account.slice(-6)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Approved projects will be automatically synced to blockchain
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {proposals.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-500">No proposals available for voting.</p>
                    </div>
                ) : (
                    proposals.map(proposal => {
                        const userVote = getUserVote(proposal)
                        const { approves, rejects, total } = getVoteCounts(proposal)
                        const isVoting = votingStates[proposal.id]

                        return (
                            <div key={proposal.id} className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {proposal.project.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${proposal.dao_status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : proposal.dao_status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {proposal.dao_status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-4">
                                                <p><strong>Researcher:</strong> {proposal.project.researcher?.full_name}</p>
                                                <p><strong>University:</strong> {proposal.project.university?.name}</p>
                                                <p><strong>Funding Goal:</strong> ${proposal.project.funding_goal.toLocaleString()}</p>
                                            </div>

                                            <p className="text-gray-700 mb-4">
                                                {proposal.project.summary}
                                            </p>

                                            {proposal.proposal_document_url && (
                                                <div className="mb-4">
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proposals/${proposal.proposal_document_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        Download Proposal Document
                                                    </a>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                                <span className="flex items-center">
                                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                                    {approves} Approve{approves !== 1 ? 's' : ''}
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                                    {rejects} Reject{rejects !== 1 ? 's' : ''}
                                                </span>
                                                <span>Total: {total} vote{total !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Voting Section */}
                                    {proposal.dao_status === 'pending_vote' && !userVote && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Comments (Optional)
                                                </label>
                                                <textarea
                                                    value={voteComments[proposal.id] || ''}
                                                    onChange={(e) => setVoteComments(prev => ({
                                                        ...prev,
                                                        [proposal.id]: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    rows={2}
                                                    placeholder="Add your comments about this proposal..."
                                                />
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => submitVote(proposal.id, 'approve')}
                                                    disabled={isVoting}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {isVoting ? 'Voting...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => submitVote(proposal.id, 'reject')}
                                                    disabled={isVoting}
                                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isVoting ? 'Voting...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* User's Vote Display */}
                                    {userVote && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className={`p-3 rounded-lg ${userVote.vote === 'approve'
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-red-50 border border-red-200'
                                                }`}>
                                                <p className={`font-medium ${userVote.vote === 'approve' ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                    You voted to {userVote.vote}
                                                </p>
                                                {userVote.comments && (
                                                    <p className={`text-sm mt-1 ${userVote.vote === 'approve' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        &ldquo;{userVote.comments}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Votes Display */}
                                    {proposal.votes && proposal.votes.length > 0 && (
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-medium text-gray-900 mb-3">All Votes</h4>
                                            <div className="space-y-2">
                                                {proposal.votes.map(vote => (
                                                    <div key={vote.id} className="flex items-start space-x-3 text-sm">
                                                        <span className={`w-2 h-2 rounded-full mt-2 ${vote.vote === 'approve' ? 'bg-green-500' : 'bg-red-500'
                                                            }`}></span>
                                                        <div>
                                                            <p className="font-medium">
                                                                {vote.validator?.full_name} - {vote.vote}
                                                            </p>
                                                            {vote.comments && (
                                                                <p className="text-gray-600">&ldquo;{vote.comments}&rdquo;</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
