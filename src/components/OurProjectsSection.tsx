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

    // Get category label and risk level
    const getCategoryInfo = (title: string, summary: string | null) => {
        const text = (title + ' ' + (summary || '')).toLowerCase()
        if (text.includes('cancer') || text.includes('immunotherapy') || text.includes('medical')) {
            return { category: 'Cancer Research', risk: 'Low Risk', riskColor: 'text-green-600' }
        } else if (text.includes('solar') || text.includes('renewable') || text.includes('energy')) {
            return { category: 'Renewable Energy', risk: 'Medium Risk', riskColor: 'text-yellow-600' }
        } else if (text.includes('water') || text.includes('purification') || text.includes('environment')) {
            return { category: 'Water Technology', risk: 'Low Risk', riskColor: 'text-green-600' }
        } else {
            return { category: 'Research', risk: 'Medium Risk', riskColor: 'text-yellow-600' }
        }
    }

    const categoryInfo = getCategoryInfo(project.title, project.summary)
    const backerCount = Math.floor(Math.random() * 500) + 50 // Mock backer count

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header Image with Overlay */}
            <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-600 p-6">
                <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                        {categoryInfo.category}
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {categoryInfo.risk}
                    </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.profiles.full_name || 'Researcher')}&background=random`}
                                alt={project.profiles.full_name || 'Researcher'}
                                className="w-10 h-10 rounded-full border-2 border-white/30"
                            />
                            <div className="text-white">
                                <div className="text-sm font-medium">{project.profiles.full_name || 'Researcher'}</div>
                                <div className="text-xs text-white/80">Principal Investigator</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {project.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {project.summary || 'Groundbreaking research project seeking funding to advance scientific knowledge and innovation.'}
                </p>

                {/* Funding Progress */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Funding Progress</span>
                        <span className="text-sm font-bold text-gray-900">{fundingPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-900">
                            ${(project.funds_raised / 1000).toFixed(1)}k raised
                        </span>
                        <span className="text-gray-600">
                            ${(project.funding_goal / 1000).toFixed(0)}k goal
                        </span>
                    </div>
                </div>

                {/* Stats and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-xs">{backerCount} Backers</span>
                        </div>
                        <div className="text-green-600 text-sm font-bold">
                            Token Price: $9.13
                        </div>
                    </div>
                </div>

                <Link
                    href={`/projects/${project.id}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Project
                </Link>
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
