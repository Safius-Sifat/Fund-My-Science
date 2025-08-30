'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAuthWithTimeout } from '@/hooks/useAuth'

export default function AuthTestPage() {
    const auth = useAuth()
    const authWithTimeout = useAuthWithTimeout(2000) // 2 second timeout

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Auth State Test</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-semibold mb-3">Default Auth Hook</h2>
                    <div className="space-y-2 text-sm">
                        <div>Loading: <span className={auth.loading ? 'text-red-600' : 'text-green-600'}>{auth.loading ? 'true' : 'false'}</span></div>
                        <div>User: <span className={auth.user ? 'text-green-600' : 'text-gray-600'}>{auth.user ? 'authenticated' : 'not authenticated'}</span></div>
                        <div>Profile: <span className={auth.profile ? 'text-green-600' : 'text-gray-600'}>{auth.profile ? 'loaded' : 'not loaded'}</span></div>
                        <div>Session: <span className={auth.session ? 'text-green-600' : 'text-gray-600'}>{auth.session ? 'active' : 'inactive'}</span></div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-semibold mb-3">Auth Hook with Timeout</h2>
                    <div className="space-y-2 text-sm">
                        <div>Loading: <span className={authWithTimeout.loading ? 'text-red-600' : 'text-green-600'}>{authWithTimeout.loading ? 'true' : 'false'}</span></div>
                        <div>Timed Out: <span className={authWithTimeout.isTimedOut ? 'text-red-600' : 'text-green-600'}>{authWithTimeout.isTimedOut ? 'true' : 'false'}</span></div>
                        <div>User: <span className={authWithTimeout.user ? 'text-green-600' : 'text-gray-600'}>{authWithTimeout.user ? 'authenticated' : 'not authenticated'}</span></div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="font-semibold mb-3">Actions</h2>
                <div className="space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => auth.refreshProfile()}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Refresh Profile
                    </button>
                </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify({
                            user: auth.user ? { id: auth.user.id, email: auth.user.email } : null,
                            profile: auth.profile,
                            session: auth.session ? { access_token: auth.session.access_token?.substring(0, 20) + '...' } : null
                        }, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}
