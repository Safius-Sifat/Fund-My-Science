'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        userRole: 'investor',
        website: '',
        universityId: ''
    })

    const [universities, setUniversities] = useState<Array<{ id: number, name: string }>>([])

    // Fetch universities on component mount
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            setIsLoading(false)
            return
        }

        if (formData.userRole === 'researcher' && !formData.universityId) {
            setError('University is required for researchers')
            setIsLoading(false)
            return
        }

        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        user_role: formData.userRole,
                        website: formData.website,
                        university_id: formData.universityId ? parseInt(formData.universityId) : null
                    }
                }
            })

            if (authError) {
                setError(authError.message)
                setIsLoading(false)
                return
            }

            // If successful, redirect to a confirmation page or dashboard
            if (authData.user) {
                router.push('/auth/verify-email')
            }

        } catch {
            setError('An unexpected error occurred')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <h1 className="text-2xl font-bold text-blue-600">FundMyScience</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="researcher@university.edu"
                                />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Dr. Jane Smith"
                                />
                            </div>
                        </div>

                        {/* User Role */}
                        <div>
                            <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">
                                I am a *
                            </label>
                            <div className="mt-1">
                                <select
                                    id="userRole"
                                    name="userRole"
                                    required
                                    value={formData.userRole}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="investor">Investor</option>
                                    <option value="researcher">Researcher</option>
                                    <option value="validator">DAO Validator</option>
                                </select>
                            </div>
                        </div>

                        {/* University (conditional for researchers) */}
                        {formData.userRole === 'researcher' && (
                            <div>
                                <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
                                    University/Institution *
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="universityId"
                                        name="universityId"
                                        required
                                        value={formData.universityId}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        )}

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Website/LinkedIn (Optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Account types</span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <div><strong>Researcher:</strong> Submit research proposals and receive funding</div>
                            <div><strong>Investor:</strong> Fund promising research projects</div>
                            <div><strong>DAO Validator:</strong> Review and vote on research proposals</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
