'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Project {
    id: string
    title: string
    current_funding_usd: number
    funding_goal_usd: number
    status: string
    created_at: string
}

interface Investment {
    id: string
    amount_usd: number
    created_at: string
    projects?: Project
}

interface Milestone {
    id: string
    status: string
}

interface ProjectWithDetails extends Project {
    investments?: Investment[]
    milestones?: Milestone[]
}

interface DashboardStats {
    researcher: {
        totalProjects: number
        totalFunding: number
        completedMilestones: number
        recentProjects: ProjectWithDetails[]
    }
    investor: {
        totalInvestments: number
        totalInvested: number
        portfolioValue: number
        recentInvestments: Investment[]
    }
    validator: {
        pendingReviews: number
        completedReviews: number
        reputationScore: number
    }
}

export default function DashboardPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats>({
        researcher: {
            totalProjects: 0,
            totalFunding: 0,
            completedMilestones: 0,
            recentProjects: []
        },
        investor: {
            totalInvestments: 0,
            totalInvested: 0,
            portfolioValue: 0,
            recentInvestments: []
        },
        validator: {
            pendingReviews: 0,
            completedReviews: 0,
            reputationScore: 0
        }
    })
    const [dataLoading, setDataLoading] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        if (!user || !profile) return

        setDataLoading(true)

        try {
            if (profile.user_role === 'researcher') {
                // Fetch researcher stats
                const { data: projects } = await supabase
                    .from('projects')
                    .select(`
                        *,
                        investments (amount_usd),
                        milestones (id, status)
                    `)
                    .eq('researcher_id', user.id)

                const totalFunding = projects?.reduce((sum, project) => {
                    const projectFunding = project.investments?.reduce((investSum: number, inv: Investment) =>
                        investSum + (inv.amount_usd || 0), 0) || 0
                    return sum + projectFunding
                }, 0) || 0

                const completedMilestones = projects?.reduce((count, project) => {
                    const completed = project.milestones?.filter((m: Milestone) => m.status === 'completed').length || 0
                    return count + completed
                }, 0) || 0

                setStats(prev => ({
                    ...prev,
                    researcher: {
                        totalProjects: projects?.length || 0,
                        totalFunding,
                        completedMilestones,
                        recentProjects: projects?.slice(-3) || []
                    }
                }))
            } else if (profile.user_role === 'investor') {
                // Fetch investor stats
                const { data: investments } = await supabase
                    .from('investments')
                    .select(`
                        *,
                        projects (title, current_funding_usd, funding_goal_usd)
                    `)
                    .eq('investor_id', user.id)

                const totalInvested = investments?.reduce((sum, inv) => sum + (inv.amount_usd || 0), 0) || 0

                // Calculate portfolio value (current value based on project progress)
                const portfolioValue = investments?.reduce((sum, inv) => {
                    const project = inv.projects
                    if (project) {
                        const progress = (project.current_funding_usd || 0) / (project.funding_goal_usd || 1)
                        return sum + (inv.amount_usd * Math.min(progress, 1))
                    }
                    return sum + inv.amount_usd
                }, 0) || 0

                setStats(prev => ({
                    ...prev,
                    investor: {
                        totalInvestments: investments?.length || 0,
                        totalInvested,
                        portfolioValue,
                        recentInvestments: investments?.slice(-3) || []
                    }
                }))
            } else if (profile.user_role === 'validator') {
                // For validators, we'll implement proposal review system later
                // For now, just use the reputation score from profile
                setStats(prev => ({
                    ...prev,
                    validator: {
                        pendingReviews: 0,
                        completedReviews: 0,
                        reputationScore: profile.reputation_score || 0
                    }
                }))
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setDataLoading(false)
        }
    }, [user, profile])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user && profile) {
            fetchDashboardData()
        }
    }, [user, profile, fetchDashboardData])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const getDashboardContent = () => {
        if (dataLoading) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        switch (profile?.user_role) {
            case 'researcher':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">My Projects</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.researcher.totalProjects}</p>
                                <p className="text-sm text-gray-500">Active research projects</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Funding</h3>
                                <p className="text-3xl font-bold text-green-600">
                                    ${stats.researcher.totalFunding.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">Raised across all projects</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Milestones</h3>
                                <p className="text-3xl font-bold text-purple-600">{stats.researcher.completedMilestones}</p>
                                <p className="text-sm text-gray-500">Completed milestones</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link
                                        href="/projects/create"
                                        className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">Create New Project</h3>
                                            <p className="text-sm text-gray-500">Submit a research proposal for funding</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/projects"
                                        className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">View All Projects</h3>
                                            <p className="text-sm text-gray-500">Browse and manage your projects</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {stats.researcher.recentProjects.length > 0 && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {stats.researcher.recentProjects.map((project) => (
                                            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Status: <span className="capitalize">{project.status}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            ${project.current_funding_usd?.toLocaleString() || 0} / ${project.funding_goal_usd?.toLocaleString() || 0}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {Math.round(((project.current_funding_usd || 0) / (project.funding_goal_usd || 1)) * 100)}% funded
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'investor':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Investments</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.investor.totalInvestments}</p>
                                <p className="text-sm text-gray-500">Active investments</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Invested</h3>
                                <p className="text-3xl font-bold text-green-600">
                                    ${stats.investor.totalInvested.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">Across all projects</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Value</h3>
                                <p className="text-3xl font-bold text-purple-600">
                                    ${stats.investor.portfolioValue.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">Current portfolio value</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link
                                        href="/projects"
                                        className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">Browse Projects</h3>
                                            <p className="text-sm text-gray-500">Discover research projects to fund</p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-gray-50 opacity-75">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">My Investments</h3>
                                            <p className="text-sm text-gray-500">Coming in Phase 4</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {stats.investor.recentInvestments.length > 0 && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Recent Investments</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {stats.investor.recentInvestments.map((investment) => (
                                            <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            {investment.projects?.title || 'Unknown Project'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Invested: ${investment.amount_usd.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(investment.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 'validator':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Reviews</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.validator.pendingReviews}</p>
                                <p className="text-sm text-gray-500">Proposals awaiting review</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Reviews Completed</h3>
                                <p className="text-3xl font-bold text-green-600">{stats.validator.completedReviews}</p>
                                <p className="text-sm text-gray-500">Total proposals reviewed</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Validation Score</h3>
                                <p className="text-3xl font-bold text-purple-600">{stats.validator.reputationScore}</p>
                                <p className="text-sm text-gray-500">Your validator reputation</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-gray-50 opacity-75">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">Review Proposals</h3>
                                            <p className="text-sm text-gray-500">Coming in Phase 4</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-gray-50 opacity-75">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-600">DAO Governance</h3>
                                            <p className="text-sm text-gray-500">Coming in Phase 5</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Browse Projects</h2>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    As a validator, you can browse all research projects to stay informed about the platform&apos;s activity.
                                </p>
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    View All Projects
                                </Link>
                            </div>
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to FundMyScience!</h2>
                        <p className="text-gray-600">
                            Please complete your profile to get started with the platform.
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {profile?.full_name || user.email}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Here&apos;s what&apos;s happening with your {profile?.user_role} account.
                    </p>
                </div>

                {getDashboardContent()}
            </div>
        </div>
    )
}
