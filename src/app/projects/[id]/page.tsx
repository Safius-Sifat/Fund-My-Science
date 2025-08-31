'use client'

import InvestmentModal from '@/components/InvestmentModal'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getFileUrl } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface ProjectDetails {
    id: number
    title: string
    summary: string | null
    cover_image_url: string | null
    status: string
    funding_goal: number
    funds_raised: number
    created_at: string
    updated_at: string
    researcher_id: string
    blockchain_project_id: number | null
    blockchain_status: string | null
    blockchain_tx_hash: string | null
    profiles: {
        full_name: string | null
        website: string | null
        reputation_score: number
    } | null
    universities: {
        name: string
        website: string | null
    } | null
    proposals: {
        id: number
        proposal_document_url: string | null
        ai_feasibility_score: number | null
        ai_market_potential_score: number | null
        ai_summary: string | null
        dao_status: string
    }[]
    milestones: {
        id: number
        title: string
        description: string | null
        funding_amount: number
        status: string
        target_date: string | null
        verification_evidence_url: string | null
    }[]
    investments: {
        id: number
        amount: number
        created_at: string
        profiles: {
            full_name: string | null
        } | null
    }[]
}

export default function ProjectDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user, profile } = useAuth()
    const [project, setProject] = useState<ProjectDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showInvestModal, setShowInvestModal] = useState(false)

    const handleInvestmentSuccess = () => {
        // Refresh project data after successful investment
        fetchProject()
    }

    const fetchProject = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          profiles!researcher_id (
            full_name,
            website,
            reputation_score
          ),
          universities (
            name,
            website
          ),
          proposals (
            id,
            proposal_document_url,
            ai_feasibility_score,
            ai_market_potential_score,
            ai_summary,
            dao_status
          ),
          milestones (
            id,
            title,
            description,
            funding_amount,
            status,
            target_date,
            verification_evidence_url
          ),
          investments (
            id,
            amount,
            created_at,
            profiles!investor_id (
              full_name
            )
          )
        `)
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching project:', error)
                router.push('/projects')
            } else {
                setProject(data)
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            router.push('/projects')
        } finally {
            setIsLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        if (id) {
            fetchProject()
        }
    }, [id, fetchProject])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'pending_vote': return 'bg-yellow-100 text-yellow-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'in_review': return 'bg-orange-100 text-orange-800'
            case 'paid': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getMilestoneProgress = () => {
        if (!project?.milestones) return 0
        const completedMilestones = project.milestones.filter(m => m.status === 'approved' || m.status === 'paid').length
        return (completedMilestones / project.milestones.length) * 100
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
                    <Link href="/projects" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        ← Back to Projects
                    </Link>
                </div>
            </div>
        )
    }

    const fundingProgress = (project.funds_raised / project.funding_goal) * 100

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ← Back to Projects
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Header */}
                        <div className="bg-white rounded-lg shadow">
                            {project.cover_image_url && (
                                <div className="w-full h-64 relative">
                                    <Image
                                        src={getFileUrl('project-covers', project.cover_image_url)}
                                        alt={project.title}
                                        fill
                                        className="object-cover rounded-t-lg"
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                                    <div className="flex space-x-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                        {project.proposals[0] && (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.proposals[0].dao_status)}`}>
                                                {project.proposals[0].dao_status.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Researcher</p>
                                        <p className="font-medium text-gray-900">{project.profiles?.full_name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">University</p>
                                        <p className="font-medium text-gray-900">{project.universities?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Goal</p>
                                        <p className="font-medium text-gray-900">${project.funding_goal.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Raised</p>
                                        <p className="font-medium text-gray-900">${project.funds_raised.toLocaleString()}</p>
                                    </div>
                                </div>

                                {project.summary && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Summary</h2>
                                        <p className="text-gray-700 leading-relaxed">{project.summary}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Evaluation */}
                        {project.proposals[0] && (project.proposals[0].ai_feasibility_score || project.proposals[0].ai_summary) && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Evaluation</h2>

                                {(project.proposals[0].ai_feasibility_score || project.proposals[0].ai_market_potential_score) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {project.proposals[0].ai_feasibility_score && (
                                            <div>
                                                <p className="text-sm text-gray-500">Feasibility Score</p>
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${project.proposals[0].ai_feasibility_score * 10}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{project.proposals[0].ai_feasibility_score}/10</span>
                                                </div>
                                            </div>
                                        )}

                                        {project.proposals[0].ai_market_potential_score && (
                                            <div>
                                                <p className="text-sm text-gray-500">Market Potential</p>
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${project.proposals[0].ai_market_potential_score * 10}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{project.proposals[0].ai_market_potential_score}/10</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {project.proposals[0].ai_summary && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">AI Summary</p>
                                        <p className="text-gray-700">{project.proposals[0].ai_summary}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Milestones */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Project Milestones</h2>
                                <span className="text-sm text-gray-500">
                                    {getMilestoneProgress().toFixed(0)}% Complete
                                </span>
                            </div>

                            <div className="space-y-4">
                                {project.milestones.map((milestone, index) => (
                                    <div key={milestone.id} className="border-l-4 border-gray-200 pl-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {index + 1}. {milestone.title}
                                                </h3>
                                                {milestone.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>Amount: ${milestone.funding_amount.toLocaleString()}</span>
                                                    {milestone.target_date && (
                                                        <span>Target: {new Date(milestone.target_date).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                                                {milestone.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Investments */}
                        {project.investments.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Investments</h2>
                                <div className="space-y-3">
                                    {project.investments.slice(0, 5).map((investment) => (
                                        <div key={investment.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {investment.profiles?.full_name || 'Anonymous Investor'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(investment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-green-600">
                                                ${investment.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Funding Progress */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Progress</h3>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-800 mb-1">
                                    <span className="font-medium">Progress</span>
                                    <span className="font-bold">{fundingProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full"
                                        style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Raised:</span>
                                    <span className="font-bold text-gray-900">${project.funds_raised.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Goal:</span>
                                    <span className="font-bold text-gray-900">${project.funding_goal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Remaining:</span>
                                    <span className="font-bold text-gray-900">${(project.funding_goal - project.funds_raised).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Investors:</span>
                                    <span className="font-bold text-gray-900">{project.investments.length}</span>
                                </div>
                            </div>

                            {user && profile?.user_role === 'investor' && project.status === 'active' && user.id !== project.researcher_id && (
                                <button
                                    onClick={() => setShowInvestModal(true)}
                                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                                >
                                    Invest in Project
                                </button>
                            )}

                            {user && user.id === project.researcher_id && (
                                <div className="w-full mt-4 bg-gray-100 text-gray-600 py-2 px-4 rounded-md font-medium text-center">
                                    You cannot invest in your own project
                                </div>
                            )}
                        </div>

                        {/* Project Documents */}
                        {project.proposals[0]?.proposal_document_url && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Documents</h3>
                                <a
                                    href={getFileUrl('proposals', project.proposals[0].proposal_document_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    View Proposal Document
                                </a>
                            </div>
                        )}

                        {/* Researcher Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Researcher</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium text-gray-900">{project.profiles?.full_name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-600">{project.universities?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Reputation Score</p>
                                    <p className="font-medium">{project.profiles?.reputation_score || 0}</p>
                                </div>
                                {project.profiles?.website && (
                                    <a
                                        href={project.profiles.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View Profile →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Investment Modal */}
            <InvestmentModal
                isOpen={showInvestModal}
                onClose={() => setShowInvestModal(false)}
                projectId={project.id}
                blockchainProjectId={project.blockchain_project_id}
                projectTitle={project.title}
                fundingGoal={project.funding_goal}
                fundsRaised={project.funds_raised}
                researcherId={project.researcher_id}
                onInvestmentSuccess={handleInvestmentSuccess}
            />
        </div>
    )
}
