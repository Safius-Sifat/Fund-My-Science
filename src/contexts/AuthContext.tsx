'use client'

import { Profile, supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error fetching profile:', error)
            return null
        }
    }

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            console.log('Starting sign out process...')

            const { error } = await supabase.auth.signOut()

            if (error) {
                console.error('Error signing out:', error)
                throw error
            }

            console.log('Supabase sign out successful, clearing state...')
            setUser(null)
            setProfile(null)
            setSession(null)

            console.log('Auth state cleared successfully')

        } catch (error) {
            console.error('Unexpected error during sign out:', error)
            // Still clear the local state even if there's an error
            setUser(null)
            setProfile(null)
            setSession(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true

        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error getting session:', error)
                    if (mounted) {
                        setLoading(false)
                    }
                    return
                }

                if (mounted) {
                    setSession(session)
                    setUser(session?.user ?? null)

                    if (session?.user) {
                        const profileData = await fetchProfile(session.user.id)
                        if (mounted) {
                            setProfile(profileData)
                        }
                    }

                    setLoading(false)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        // Set a timeout to ensure loading doesn't hang indefinitely
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn('Auth initialization timeout - setting loading to false')
                setLoading(false)
            }
        }, 50000) // 5 second timeout

        initializeAuth()

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            console.log('Auth state changed:', event, session?.user?.id)

            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                try {
                    const profileData = await fetchProfile(session.user.id)
                    if (mounted) {
                        setProfile(profileData)
                    }
                } catch (error) {
                    console.error('Error fetching profile on auth change:', error)
                }
            } else {
                setProfile(null)
            }

            // Always set loading to false after auth state changes
            setLoading(false)
        })

        return () => {
            mounted = false
            clearTimeout(timeoutId)
            subscription.unsubscribe()
        }
    }, []) // Run only once on mount

    const value = {
        user,
        profile,
        session,
        loading,
        signOut,
        refreshProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
