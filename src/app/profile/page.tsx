'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function ProfilePage() {
    const { user, profile, refreshProfile, loading } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [universities, setUniversities] = useState<Array<{ id: number, name: string }>>([])
    const [userStats, setUserStats] = useState({
        projectsCount: 0,
        totalFundsRaised: 0,
        totalInvested: 0,
        projectsFunded: 0
    })

    const [formData, setFormData] = useState({
        fullName: '',
        website: '',
        userRole: 'investor',
        universityId: ''
    })

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
    }, [user, loading, router])

    // Load profile data when it becomes available
    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.full_name || '',
                website: profile.website || '',
                userRole: profile.user_role,
                universityId: profile.university_id?.toString() || ''
            })
        }
    }, [profile])

    // Fetch universities
    useEffect(() => {
        fetchUniversities()
    }, [])

    const fetchUserStats = useCallback(async () => {
        if (!user) return

        try {
            // Fetch user's projects (for researchers)
            const { data: projects } = await supabase
                .from('projects')
                .select('funding_goal, funds_raised')
                .eq('researcher_id', user.id)

            // Fetch user's investments (for investors)
            const { data: investments } = await supabase
                .from('investments')
                .select('amount')
                .eq('investor_id', user.id)

            // Calculate stats
            const projectsCount = projects?.length || 0
            const totalFundsRaised = projects?.reduce((sum, project) => sum + (project.funds_raised || 0), 0) || 0
            const totalInvested = investments?.reduce((sum, investment) => sum + (investment.amount || 0), 0) || 0
            const projectsFunded = investments?.length || 0

            setUserStats({
                projectsCount,
                totalFundsRaised,
                totalInvested,
                projectsFunded
            })
        } catch (error) {
            console.error('Error fetching user stats:', error)
        }
    }, [user])

    // Refresh profile data when component mounts and user is available
    useEffect(() => {
        if (user && !loading) {
            refreshProfile()
            fetchUserStats()
        }
    }, [user, loading, refreshProfile, fetchUserStats])

    const fetchUniversities = async () => {
        const { data } = await supabase
            .from('universities')
            .select('id, name')
            .eq('is_verified', true)
            .order('name')

        if (data) {
            setUniversities(data)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    website: formData.website,
                    user_role: formData.userRole,
                    university_id: formData.universityId ? parseInt(formData.universityId) : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id)

            if (updateError) {
                setError(updateError.message)
            } else {
                setSuccess('Profile updated successfully!')
                setIsEditing(false)
                await refreshProfile()
            }
        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-3xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
                </div>

                {/* Quick Actions for Researchers */}
                {profile?.user_role === 'researcher' && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => router.push('/projects/create')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create New Project
                                </button>
                                <button
                                    onClick={() => router.push('/projects/my')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    View My Projects
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions for Investors */}
                {profile?.user_role === 'investor' && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="px-6 py-4">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => router.push('/projects')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Browse Projects
                                </button>
                                <button
                                    onClick={() => router.push('/projects/my')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    My Investments
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="px-6 py-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <select
                                        id="userRole"
                                        name="userRole"
                                        value={formData.userRole}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="investor">Investor</option>
                                        <option value="researcher">Researcher</option>
                                        <option value="validator">DAO Validator</option>
                                    </select>
                                </div>

                                {formData.userRole === 'researcher' && (
                                    <div>
                                        <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
                                            University/Institution
                                        </label>
                                        <select
                                            id="universityId"
                                            name="universityId"
                                            value={formData.universityId}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select your university...</option>
                                            {universities.map((university) => (
                                                <option key={university.id} value={university.id}>
                                                    {university.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                        Website/LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://"
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setError(null)
                                            setSuccess(null)
                                            // Reset form data
                                            if (profile) {
                                                setFormData({
                                                    fullName: profile.full_name || '',
                                                    website: profile.website || '',
                                                    userRole: profile.user_role,
                                                    universityId: profile.university_id?.toString() || ''
                                                })
                                            }
                                        }}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{profile?.full_name || 'Not set'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {profile?.user_role}
                                    </span>
                                </div>

                                {profile?.university_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">University</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {universities.find(u => u.id === profile.university_id)?.name || 'Unknown'}
                                        </p>
                                    </div>
                                )}

                                {profile?.website && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website</label>
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {profile.website}
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reputation Score</label>
                                    <p className="mt-1 text-sm text-gray-900">{profile?.reputation_score || 0}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>

                                {profile?.avatar_url && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Avatar</label>
                                        <div className="mt-1">
                                            <Image
                                                src={profile.avatar_url}
                                                alt="Profile Avatar"
                                                width={64}
                                                height={64}
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Statistics for Researchers */}
                {profile?.user_role === 'researcher' && (
                    <div className="bg-white shadow rounded-lg mt-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Research Activity</h2>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{userStats.projectsCount}</div>
                                    <div className="text-sm text-gray-500">Active Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">${userStats.totalFundsRaised.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Total Funds Raised</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{profile?.reputation_score || 0}</div>
                                    <div className="text-sm text-gray-500">Reputation Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Statistics for Investors */}
                {profile?.user_role === 'investor' && (
                    <div className="bg-white shadow rounded-lg mt-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Investment Activity</h2>
                        </div>
                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{userStats.projectsFunded}</div>
                                    <div className="text-sm text-gray-500">Projects Funded</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">${userStats.totalInvested.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Total Invested</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{profile?.reputation_score || 0}</div>
                                    <div className="text-sm text-gray-500">Reputation Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
