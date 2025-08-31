'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getFileUrl } from '@/lib/storage'
import { Project, supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface ProjectWithProposal extends Project {
    proposals: {
        id: number
        dao_status: string
        ai_feasibility_score: number | null
        ai_market_potential_score: number | null
    }[]
    milestones: {
        id: number
        title: string
        status: string
        funding_amount: number
    }[]
}

export default function MyProjectsPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<ProjectWithProposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [submittingReview, setSubmittingReview] = useState<{ [key: number]: boolean }>({})

    const fetchMyProjects = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          proposals (
            id,
            dao_status,
            ai_feasibility_score,
            ai_market_potential_score
          ),
          milestones (
            id,
            title,
            status,
            funding_amount
          )
        `)
                .eq('researcher_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching projects:', error)
            } else {
                setProjects(data || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user?.id])

    const submitForReview = async (projectId: number) => {
        setSubmittingReview(prev => ({ ...prev, [projectId]: true }))

        try {
            // Get project details including proposal document URL
            const { data: projectData, error: fetchError } = await supabase
                .from('projects')
                .select('proposal_document_url')
                .eq('id', projectId)
                .single()

            if (fetchError) throw fetchError

            // Update project status to pending_approval
            const { error: projectError } = await supabase
                .from('projects')
                .update({
                    status: 'pending_approval',
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId)

            if (projectError) throw projectError

            // Ensure proposal exists and update its status
            const { data: existingProposal } = await supabase
                .from('proposals')
                .select('id')
                .eq('project_id', projectId)
                .single()

            if (!existingProposal) {
                // Create proposal if it doesn't exist
                const { error: proposalError } = await supabase
                    .from('proposals')
                    .insert({
                        project_id: projectId,
                        proposal_document_url: projectData.proposal_document_url,
                        dao_status: 'pending_vote'
                    })

                if (proposalError) throw proposalError
            } else {
                // Update existing proposal
                const { error: proposalError } = await supabase
                    .from('proposals')
                    .update({
                        dao_status: 'pending_vote',
                        proposal_document_url: projectData.proposal_document_url
                    })
                    .eq('project_id', projectId)

                if (proposalError) throw proposalError
            }

            // Refresh projects list
            await fetchMyProjects()

            alert('Project submitted for DAO review successfully!')
        } catch (error) {
            console.error('Error submitting for review:', error)
            alert('Failed to submit project for review. Please try again.')
        } finally {
            setSubmittingReview(prev => ({ ...prev, [projectId]: false }))
        }
    }

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        } else if (!loading && profile?.user_role !== 'researcher') {
            router.push('/dashboard')
        } else if (user) {
            fetchMyProjects()
        }
    }, [user, profile, loading, router, fetchMyProjects])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
            case 'active': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getDaoStatusColor = (status: string) => {
        switch (status) {
            case 'pending_vote': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Research Projects</h1>
                        <p className="mt-2 text-gray-600">
                            Manage your research proposals and track funding progress
                        </p>
                    </div>
                    <Link
                        href="/projects/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        New Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            No projects yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Get started by creating your first research project proposal.
                        </p>
                        <Link
                            href="/projects/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Create Your First Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {project.cover_image_url && (
                                    <div className="h-48 bg-gray-200 relative">
                                        <Image
                                            src={getFileUrl('project-covers', project.cover_image_url)}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                            {project.title}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {project.summary}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Funding Goal:</span>
                                            <span className="font-medium text-gray-900">${project.funding_goal.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Raised:</span>
                                            <span className="font-medium text-green-600">
                                                ${project.funds_raised.toLocaleString()}
                                            </span>
                                        </div>

                                        {project.proposals.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">DAO Status:</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDaoStatusColor(project.proposals[0].dao_status)}`}>
                                                    {project.proposals[0].dao_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}

                                        {project.proposals.length > 0 && project.proposals[0].ai_feasibility_score && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">AI Feasibility:</span>
                                                    <span className="font-medium">
                                                        {(project.proposals[0].ai_feasibility_score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Market Potential:</span>
                                                    <span className="font-medium">
                                                        {((project.proposals[0].ai_market_potential_score || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Milestones:</span>
                                            <span className="font-medium">
                                                {project.milestones.filter(m => m.status === 'approved').length} / {project.milestones.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                            {project.status === 'draft' && (
                                                <>
                                                    <Link
                                                        href={`/projects/${project.id}/edit`}
                                                        className="flex-1 text-center border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => submitForReview(project.id)}
                                                        disabled={submittingReview[project.id]}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                        {submittingReview[project.id] ? 'Submitting...' : 'Submit for Review'}
                                                    </button>
                                                </>
                                            )}
                                            {project.status === 'pending_approval' && (
                                                <div className="flex-1 text-center text-yellow-700 px-4 py-2 rounded-md text-sm font-medium bg-yellow-50 border border-yellow-200">
                                                    Under DAO Review
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
