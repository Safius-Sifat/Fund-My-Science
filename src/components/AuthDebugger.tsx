'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AuthDebugger() {
    const { user, profile, session, loading } = useAuth()

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded shadow-lg z-50 max-w-xs">
            <div className="font-bold mb-1">🔐 Auth Debug</div>
            <div>Loading: {loading ? '✓' : '✗'}</div>
            <div>User: {user ? '✓' : '✗'}</div>
            <div>Profile: {profile ? '✓' : '✗'}</div>
            <div>Session: {session ? '✓' : '✗'}</div>
            {user && (
                <div className="mt-1 text-xs opacity-75">
                    ID: {user.id.slice(0, 8)}...
                </div>
            )}
            {profile && (
                <div className="text-xs opacity-75">
                    Role: {profile.user_role}
                </div>
            )}
        </div>
    )
}
