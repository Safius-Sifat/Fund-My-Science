'use client'

import { createSampleProjects, createSampleUniversities } from '@/utils/sampleData'
import Link from 'next/link'
import { useState } from 'react'

export default function TestDataPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleCreateSampleData = async () => {
        try {
            setLoading(true)
            setMessage('Creating sample data...')

            // First create universities
            await createSampleUniversities()
            setMessage('Universities created... Creating projects...')

            // Then create projects
            await createSampleProjects()
            setMessage('Sample data created successfully!')
        } catch (error) {
            console.error('Error:', error)
            setMessage('Error creating sample data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Data Management</h1>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Create Sample Projects</h2>
                    <p className="text-gray-600 mb-6">
                        This will create sample universities and research projects in the database for testing the home page.
                    </p>

                    <button
                        onClick={handleCreateSampleData}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        {loading ? 'Creating...' : 'Create Sample Data'}
                    </button>

                    {message && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800">{message}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Home Page</h2>
                    <p className="text-gray-600 mb-4">
                        After creating sample data, visit the home page to see the dynamic projects in action.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        Go to Home Page
                    </Link>
                </div>
            </div>
        </div>
    )
}
