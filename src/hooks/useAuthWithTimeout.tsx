import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface UseAuthWithTimeoutOptions {
    timeout?: number
    redirectTo?: string
    skipRedirect?: boolean
}

export function useAuthWithTimeout(options: UseAuthWithTimeoutOptions = {}) {
    const { timeout = 15000, redirectTo = '/auth/signin', skipRedirect = false } = options
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (skipRedirect) return

        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('Auth loading timeout - redirecting to sign in')
                router.push(redirectTo)
            }
        }, timeout)

        // Clear timeout if loading completes
        if (!loading) {
            clearTimeout(timeoutId)
        }

        return () => clearTimeout(timeoutId)
    }, [loading, timeout, redirectTo, router, skipRedirect])

    return { user, loading }
}
