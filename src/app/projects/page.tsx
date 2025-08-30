'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getFileUrl } from '@/lib/storage'
import { Project, supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ProjectWithDetails extends Project {
    profiles: {
        full_name: string | null
    } | null
    universities: {
        name: string
    } | null
    proposals: {
        dao_status: string
    }[]
}

export default function ProjectsPage() {
    const { user, loading } = useAuth()
    const [projects, setProjects] = useState<ProjectWithDetails[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          profiles!researcher_id (
            full_name
          ),
          universities (
            name
          ),
          proposals (
            dao_status
          )
        `)
                .not('status', 'eq', 'draft')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching projects:', error)
            } else {
                setProjects(data || [])
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.summary?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getProjectStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getDAOStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800'
            case 'pending_vote': return 'bg-yellow-100 text-yellow-800'
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
                            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Research Projects</h1>
                            <p className="mt-2 text-gray-600">
                                Discover groundbreaking research projects seeking funding
                            </p>
                        </div>
                        {user && (
                            <Link
                                href="/projects/create"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Create Project
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search Projects
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by title or description..."
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Status
                            </label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Projects</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Be the first to create a research project!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                {project.cover_image_url && (
                                    <div className="aspect-w-16 aspect-h-9">
                                        <Image
                                            src={getFileUrl('project-covers', project.cover_image_url)}
                                            alt={project.title}
                                            width={400}
                                            height={200}
                                            className="w-full h-48 object-cover rounded-t-lg"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                            {project.title}
                                        </h3>
                                        <div className="flex flex-col space-y-1 ml-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                            {project.proposals?.[0] && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDAOStatusColor(project.proposals[0].dao_status)}`}>
                                                    {project.proposals[0].dao_status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {project.summary}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Researcher:</span>
                                            <span className="font-medium">{project.profiles?.full_name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">University:</span>
                                            <span className="font-medium">{project.universities?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Goal:</span>
                                            <span className="font-medium">${project.funding_goal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Raised:</span>
                                            <span className="font-medium">${project.funds_raised.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round((project.funds_raised / project.funding_goal) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((project.funds_raised / project.funding_goal) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
