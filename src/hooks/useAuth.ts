'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

/**
 * Enhanced auth hook with better loading state management
 */
export function useAuthWithTimeout(timeoutMs = 3000) {
    const auth = useAuth()
    const [isTimedOut, setIsTimedOut] = useState(false)

    useEffect(() => {
        if (auth.loading) {
            const timer = setTimeout(() => {
                setIsTimedOut(true)
                console.warn('Auth loading timeout reached')
            }, timeoutMs)

            return () => clearTimeout(timer)
        } else {
            setIsTimedOut(false)
        }
    }, [auth.loading, timeoutMs])

    return {
        ...auth,
        loading: auth.loading && !isTimedOut,
        isTimedOut
    }
}

/**
 * Hook to check if user is authenticated with loading state
 */
export function useIsAuthenticated() {
    const { user, loading } = useAuth()

    return {
        isAuthenticated: !!user,
        isLoading: loading,
        user
    }
}

/**
 * Hook to require authentication with redirect
 */
export function useRequireAuth(redirectTo = '/auth/login') {
    const { user, loading } = useAuth()
    const [shouldRedirect, setShouldRedirect] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            setShouldRedirect(true)
        } else {
            setShouldRedirect(false)
        }
    }, [user, loading])

    return {
        user,
        loading,
        shouldRedirect,
        redirectTo
    }
}
