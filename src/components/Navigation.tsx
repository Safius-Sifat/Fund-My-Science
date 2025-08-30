'use client'

import { useAuthWithTimeout } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navigation() {
    // Use timeout hook to prevent infinite loading
    const { user, profile, signOut, loading } = useAuthWithTimeout(30000)
    const router = useRouter()

    if (loading) {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-blue-600">
                                FundMyScience
                            </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            FundMyScience
                        </Link>

                        {user && (
                            <div className="hidden md:flex space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/projects"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Browse Projects
                                </Link>

                                {profile?.user_role === 'researcher' && (
                                    <>
                                        <Link
                                            href="/projects/my"
                                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            My Projects
                                        </Link>
                                        <Link
                                            href="/projects/create"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Create Project
                                        </Link>
                                    </>
                                )}

                                {profile?.user_role === 'investor' && (
                                    <Link
                                        href="/projects/my"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        My Investments
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/profile"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {profile?.full_name || user.email}
                                </Link>
                                <button
                                    onClick={async () => {
                                        console.log('Sign out button clicked')
                                        try {
                                            await signOut()
                                            console.log('Sign out completed, redirecting to home...')
                                            router.push('/')
                                        } catch (error) {
                                            console.error('Sign out failed:', error)
                                            // Still redirect even if there's an error
                                            router.push('/')
                                        }
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
