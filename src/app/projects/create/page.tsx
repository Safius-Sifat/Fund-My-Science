'use client'

import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { uploadFile } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface University {
    id: number
    name: string
}

interface Milestone {
    id: string
    title: string
    description: string
    funding_amount: number
    target_date: string
}

export default function CreateProjectPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [universities, setUniversities] = useState<University[]>([])

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        funding_goal: '',
        university_id: profile?.university_id?.toString() || ''
    })

    const [milestones, setMilestones] = useState<Milestone[]>([
        {
            id: '1',
            title: '',
            description: '',
            funding_amount: 0,
            target_date: ''
        }
    ])

    const [files, setFiles] = useState<{
        coverImage: File | null
        proposalDocument: File | null
    }>({
        coverImage: null,
        proposalDocument: null
    })

    // Redirect if not researcher
    useEffect(() => {
        if (!loading && (!user || profile?.user_role !== 'researcher')) {
            router.push('/dashboard')
        }
    }, [user, profile, loading, router])

    // Fetch universities
    useEffect(() => {
        fetchUniversities()
    }, [])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'coverImage' | 'proposalDocument') => {
        const file = e.target.files?.[0] || null
        setFiles(prev => ({ ...prev, [fileType]: file }))
    }

    const addMilestone = () => {
        const newMilestone: Milestone = {
            id: Date.now().toString(),
            title: '',
            description: '',
            funding_amount: 0,
            target_date: ''
        }
        setMilestones(prev => [...prev, newMilestone])
    }

    const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
        setMilestones(prev => prev.map(milestone =>
            milestone.id === id ? { ...milestone, [field]: value } : milestone
        ))
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(prev => prev.filter(milestone => milestone.id !== id))
        }
    }

    const validateForm = () => {
        if (!formData.title.trim()) return 'Project title is required'
        if (!formData.summary.trim()) return 'Project summary is required'
        if (!formData.funding_goal || parseFloat(formData.funding_goal) <= 0) return 'Valid funding goal is required'
        if (!formData.university_id) return 'University selection is required'
        if (!files.proposalDocument) return 'Proposal document is required'

        const totalMilestoneFunding = milestones.reduce((sum, m) => sum + m.funding_amount, 0)
        if (totalMilestoneFunding !== parseFloat(formData.funding_goal)) {
            return 'Total milestone funding must equal the project funding goal'
        }

        for (const milestone of milestones) {
            if (!milestone.title.trim()) return 'All milestones must have a title'
            if (!milestone.description.trim()) return 'All milestones must have a description'
            if (milestone.funding_amount <= 0) return 'All milestones must have a valid funding amount'
            if (!milestone.target_date) return 'All milestones must have a target date'
        }

        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('🚀 Starting project creation process...')
        setIsSubmitting(true)
        setError(null)

        const validationError = validateForm()
        if (validationError) {
            console.error('❌ Validation failed:', validationError)
            setError(validationError)
            setIsSubmitting(false)
            return
        }

        console.log('✅ Form validation passed')
        console.log('📝 Form data:', formData)
        console.log('📎 Files:', {
            coverImage: files.coverImage?.name || 'None',
            proposalDocument: files.proposalDocument?.name || 'None'
        })
        console.log('🎯 Milestones:', milestones)

        try {
            // Upload files
            let coverImageUrl = null
            let proposalDocumentUrl = null

            if (files.coverImage) {
                console.log('📤 Uploading cover image...')
                const { data: coverData, error: coverError } = await uploadFile(
                    files.coverImage,
                    'project-covers',
                    `covers/${user?.id}`
                )
                if (coverError) {
                    console.error('❌ Cover image upload failed:', coverError)
                    throw new Error(`Failed to upload cover image: ${coverError.message}`)
                }
                coverImageUrl = coverData?.path
                console.log('✅ Cover image uploaded:', coverImageUrl)
            }

            if (files.proposalDocument) {
                console.log('📤 Uploading proposal document...')
                const { data: docData, error: docError } = await uploadFile(
                    files.proposalDocument,
                    'proposals',
                    `documents/${user?.id}`
                )
                if (docError) {
                    console.error('❌ Proposal document upload failed:', docError)
                    throw new Error(`Failed to upload proposal document: ${docError.message}`)
                }
                proposalDocumentUrl = docData?.path
                console.log('✅ Proposal document uploaded:', proposalDocumentUrl)
            }

            // Create project
            console.log('🏗️ Creating project in database...')
            const projectInsertData = {
                researcher_id: user?.id,
                university_id: parseInt(formData.university_id),
                title: formData.title,
                summary: formData.summary,
                funding_goal: parseFloat(formData.funding_goal),
                cover_image_url: coverImageUrl,
                status: 'draft'
            }
            console.log('📊 Project insert data:', projectInsertData)

            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert(projectInsertData)
                .select()
                .single()

            if (projectError) {
                console.error('❌ Project creation failed:', projectError)
                throw new Error(`Failed to create project: ${projectError.message}`)
            }

            console.log('✅ Project created successfully:', projectData)

            // Note: Proposal will be created when project is submitted for review
            // Store proposal document URL in project for later use
            if (proposalDocumentUrl) {
                const { error: updateError } = await supabase
                    .from('projects')
                    .update({
                        proposal_document_url: proposalDocumentUrl
                    })
                    .eq('id', projectData.id)

                if (updateError) {
                    console.warn('⚠️ Failed to update project with proposal document URL:', updateError)
                }
            }

            // Create milestones
            console.log('🎯 Creating milestones in database...')
            const milestoneData = milestones.map(milestone => ({
                project_id: projectData.id,
                title: milestone.title,
                description: milestone.description,
                funding_amount: milestone.funding_amount,
                target_date: milestone.target_date,
                status: 'pending'
            }))
            console.log('📊 Milestone insert data:', milestoneData)

            const { error: milestonesError } = await supabase
                .from('milestones')
                .insert(milestoneData)

            if (milestonesError) {
                console.error('❌ Milestones creation failed:', milestonesError)
                throw new Error(`Failed to create milestones: ${milestonesError.message}`)
            }

            console.log('✅ Milestones created successfully')

            // Note: Blockchain sync happens later when project is approved by DAO
            console.log('� Project saved as draft - will sync to blockchain after DAO approval')

            console.log('🎉 Project creation completed! Redirecting to My Projects page...')

            // Redirect to my projects page so user can submit for review
            router.push(`/projects/my`)
        } catch (err) {
            console.error('💥 Project creation failed with error:', err)
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            console.error('💥 Error details:', errorMessage)
            setError(errorMessage)
        } finally {
            setIsSubmitting(false)
            console.log('🏁 Project creation process finished')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="bg-white rounded-lg shadow p-6">
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

    if (!user || profile?.user_role !== 'researcher') {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Research Project</h1>
                    <p className="mt-2 text-gray-600">
                        Submit your research proposal for community review and funding
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Project Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Project Information</h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Revolutionary Cancer Treatment Using AI"
                                />
                            </div>

                            <div>
                                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                                    Project Summary *
                                </label>
                                <textarea
                                    id="summary"
                                    name="summary"
                                    required
                                    rows={4}
                                    value={formData.summary}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Provide a compelling summary of your research project, its goals, and potential impact..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="funding_goal" className="block text-sm font-medium text-gray-700">
                                        Funding Goal (USD) *
                                    </label>
                                    <input
                                        type="number"
                                        id="funding_goal"
                                        name="funding_goal"
                                        required
                                        min="1"
                                        step="0.01"
                                        value={formData.funding_goal}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="50000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="university_id" className="block text-sm font-medium text-gray-700">
                                        University/Institution *
                                    </label>
                                    <select
                                        id="university_id"
                                        name="university_id"
                                        required
                                        value={formData.university_id}
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
                            </div>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Project Files</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                                    Cover Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="coverImage"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'coverImage')}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="mt-1 text-sm text-gray-500">PNG, JPG, or JPEG up to 10MB</p>
                            </div>

                            <div>
                                <label htmlFor="proposalDocument" className="block text-sm font-medium text-gray-700">
                                    Proposal Document *
                                </label>
                                <input
                                    type="file"
                                    id="proposalDocument"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileChange(e, 'proposalDocument')}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="mt-1 text-sm text-gray-500">PDF, DOC, or DOCX up to 25MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Project Milestones</h2>
                            <button
                                type="button"
                                onClick={addMilestone}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Add Milestone
                            </button>
                        </div>

                        <div className="space-y-6">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-md font-medium text-gray-900">Milestone {index + 1}</h3>
                                        {milestones.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(milestone.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Milestone Title *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={milestone.title}
                                                onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Research Phase 1: Data Collection"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description *
                                            </label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Detailed description of what will be accomplished in this milestone"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Funding Amount (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    step="0.01"
                                                    value={milestone.funding_amount}
                                                    onChange={(e) => updateMilestone(milestone.id, 'funding_amount', parseFloat(e.target.value) || 0)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Target Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={milestone.target_date}
                                                    onChange={(e) => updateMilestone(milestone.id, 'target_date', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span>Total Milestone Funding:</span>
                                <span className="font-medium">
                                    ${milestones.reduce((sum, m) => sum + m.funding_amount, 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Project Funding Goal:</span>
                                <span className="font-medium">${parseFloat(formData.funding_goal || '0').toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Project...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
