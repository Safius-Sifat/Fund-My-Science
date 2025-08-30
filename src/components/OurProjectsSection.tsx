'use client'

import { Profile, Project, supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ProjectWithResearcher extends Project {
    profiles: Profile
}

interface ProjectCardProps {
    project: ProjectWithResearcher
}

function ProjectCard({ project }: ProjectCardProps) {
    const fundingPercentage = Math.round((project.funds_raised / project.funding_goal) * 100)

    // Get category color based on project title/summary
    const getCategoryColor = (title: string, summary: string | null) => {
        const text = (title + ' ' + (summary || '')).toLowerCase()
        if (text.includes('cancer') || text.includes('immunotherapy') || text.includes('medical')) {
            return 'from-green-500 to-green-600'
        } else if (text.includes('solar') || text.includes('renewable') || text.includes('energy')) {
            return 'from-blue-500 to-blue-600'
        } else if (text.includes('water') || text.includes('purification') || text.includes('environment')) {
            return 'from-cyan-500 to-cyan-600'
        } else {
            return 'from-purple-500 to-purple-600'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Active Funding'
            case 'completed': return 'Completed'
            case 'pending_approval': return 'Under Review'
            default: return 'New'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-600'
            case 'active': return 'bg-white/20'
            case 'pending_approval': return 'bg-yellow-500'
            default: return 'bg-white/20'
        }
    }

    return (
        <div className={`bg-gradient-to-br ${getCategoryColor(project.title, project.summary)} rounded-2xl p-6 text-white relative overflow-hidden`}>
            <div className="absolute top-4 right-4">
                <span className={`${getStatusColor(project.status)} text-white text-xs px-2 py-1 rounded-full`}>
                    {getStatusLabel(project.status)}
                </span>
            </div>

            <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{project.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">
                            {project.profiles.full_name ? project.profiles.full_name.charAt(0) : 'R'}
                        </span>
                    </div>
                    <span className="text-sm">{project.profiles.full_name || 'Researcher'}</span>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-sm opacity-90 line-clamp-3">
                    {project.summary || 'Groundbreaking research project seeking funding to advance scientific knowledge and innovation.'}
                </p>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Funding Progress</span>
                    <span className="text-sm font-bold">{fundingPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    ></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div>
                        <div className="text-xs opacity-75">
                            ${(project.funds_raised / 1000).toFixed(0)}k raised
                        </div>
                        <div className="text-xs opacity-75">
                            Goal: ${(project.funding_goal / 1000).toFixed(0)}k
                        </div>
                    </div>
                    <Link
                        href={`/projects/${project.id}`}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        View Project
                    </Link>
                </div>
            </div>
        </div>
    )
}

interface OurProjectsSectionProps {
    showFilters?: boolean
    maxProjects?: number
}

export default function OurProjectsSection({ showFilters = true, maxProjects = 6 }: OurProjectsSectionProps) {
    const [projects, setProjects] = useState<ProjectWithResearcher[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [error, setError] = useState<string | null>(null)

    const filters = ['All', 'Cancer', 'Renewable', 'Water', 'AI/Tech']

    useEffect(() => {
        const fetchProjects = async () => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            try {
                setLoading(true)
                setError(null)
                console.log('Fetching projects from Supabase...')

                const { data, error } = await supabase
                    .from('projects')
                    .select(`
            *,
            profiles (
              id,
              full_name,
              avatar_url
            )
          `)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(maxProjects)
                    .abortSignal(controller.signal)

                clearTimeout(timeoutId)

                if (error) {
                    console.error('Error fetching projects:', error)
                    setError('Failed to load projects. Please try refreshing the page.')
                    return
                }

                console.log(`Successfully loaded ${data?.length || 0} projects`)
                setProjects(data || [])
            } catch (err) {
                clearTimeout(timeoutId)
                const error = err as Error
                if (error.name === 'AbortError') {
                    console.error('Project fetch timeout')
                    setError('Loading took too long. Please check your connection and try again.')
                } else {
                    console.error('Error:', err)
                    setError('Failed to load projects. Please try refreshing the page.')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [maxProjects])

    const refetchProjects = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(maxProjects)

            if (error) {
                console.error('Error fetching projects:', error)
                setError('Failed to load projects')
                return
            }

            setProjects(data || [])
        } catch (err) {
            console.error('Error:', err)
            setError('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    const getFilteredProjects = () => {
        if (selectedFilter === 'All') return projects

        return projects.filter(project => {
            const text = (project.title + ' ' + (project.summary || '')).toLowerCase()
            switch (selectedFilter) {
                case 'Cancer':
                    return text.includes('cancer') || text.includes('immunotherapy') || text.includes('medical')
                case 'Renewable':
                    return text.includes('solar') || text.includes('renewable') || text.includes('energy')
                case 'Water':
                    return text.includes('water') || text.includes('purification') || text.includes('environment')
                case 'AI/Tech':
                    return text.includes('ai') || text.includes('artificial') || text.includes('technology')
                default:
                    return true
            }
        })
    }

    if (error) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={refetchProjects}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Our <em className="italic">Projects</em>
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl">
                    Discover groundbreaking research opportunities and invest in the future of
                    science.
                </p>

                {/* Filter Buttons */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 mb-12">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedFilter === filter
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 hover:text-green-600 border border-gray-300 hover:border-green-600'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}

                {/* Project Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {getFilteredProjects().map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>

                        {getFilteredProjects().length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">No projects found for the selected filter.</p>
                                <button
                                    onClick={() => setSelectedFilter('All')}
                                    className="text-green-600 hover:text-green-700 font-medium"
                                >
                                    View all projects
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Load More */}
                <div className="text-center mt-12">
                    <Link
                        href="/projects"
                        className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        View All Projects
                    </Link>
                </div>
            </div>
        </section>
    )
}
