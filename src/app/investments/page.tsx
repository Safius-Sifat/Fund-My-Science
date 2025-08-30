'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getFileUrl } from '@/lib/storage'
import { Investment, supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface InvestmentWithProject extends Investment {
    projects: {
        id: number
        title: string
        summary: string | null
        cover_image_url: string | null
        status: string
        funding_goal: number
        funds_raised: number
        profiles: {
            full_name: string | null
        } | null
        universities: {
            name: string
        } | null
    } | null
}

export default function InvestmentsPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [investments, setInvestments] = useState<InvestmentWithProject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalInvested: 0,
        totalProjects: 0,
        avgInvestment: 0
    })

    const fetchInvestments = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('investments')
                .select(`
          *,
          projects (
            id,
            title,
            summary,
            cover_image_url,
            status,
            funding_goal,
            funds_raised,
            profiles!researcher_id (
              full_name
            ),
            universities (
              name
            )
          )
        `)
                .eq('investor_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching investments:', error)
            } else {
                setInvestments(data || [])

                // Calculate stats
                const totalInvested = data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
                const totalProjects = data?.length || 0
                const avgInvestment = totalProjects > 0 ? totalInvested / totalProjects : 0

                setStats({
                    totalInvested,
                    totalProjects,
                    avgInvestment
                })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        } else if (!loading && profile?.user_role !== 'investor') {
            router.push('/dashboard')
        } else if (user) {
            fetchInvestments()
        }
    }, [user, profile, loading, router, fetchInvestments])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const calculateROI = (investment: InvestmentWithProject) => {
        if (!investment.projects) return 0
        const project = investment.projects
        const fundingRatio = Number(project.funds_raised) / Number(project.funding_goal)

        // Simple ROI calculation based on funding completion
        // In a real platform, this would be based on actual returns
        if (project.status === 'completed') {
            return fundingRatio * 100 // Assume 100% return for completed projects
        } else if (project.status === 'active') {
            return fundingRatio * 50 // Assume 50% return for active projects
        }
        return 0
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
                    <p className="mt-2 text-gray-600">
                        Track your research project investments and returns
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Total Invested</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            ${stats.totalInvested.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Projects Funded</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {stats.totalProjects}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Average Investment</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            ${stats.avgInvestment.toLocaleString()}
                        </p>
                    </div>
                </div>

                {investments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            No investments yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start investing in groundbreaking research projects to build your portfolio.
                        </p>
                        <Link
                            href="/projects"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Browse Projects
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {investments.map((investment) => {
                            const project = investment.projects
                            if (!project) return null

                            return (
                                <div key={investment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                                                {project.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {project.summary}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Your Investment:</span>
                                                <span className="font-medium text-blue-600">
                                                    ${Number(investment.amount).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Project Progress:</span>
                                                <span className="font-medium">
                                                    {((Number(project.funds_raised) / Number(project.funding_goal)) * 100).toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Est. ROI:</span>
                                                <span className={`font-medium ${calculateROI(investment) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {calculateROI(investment).toFixed(1)}%
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Researcher:</span>
                                                <span className="font-medium">
                                                    {project.profiles?.full_name || 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Institution:</span>
                                                <span className="font-medium">
                                                    {project.universities?.name || 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Invested:</span>
                                                <span className="font-medium">
                                                    {new Date(investment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium block"
                                            >
                                                View Project Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
