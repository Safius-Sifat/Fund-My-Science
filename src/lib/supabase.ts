import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    },
    global: {
        headers: { 'x-my-custom-header': 'fund-my-science' },
    },
    db: {
        schema: 'public',
    },
    realtime: {
        params: {
            eventsPerSecond: 2,
        },
    },
})

// Type definitions for our database
export type UserRole = 'researcher' | 'investor' | 'validator' | 'admin'
export type ProjectStatus = 'draft' | 'pending_approval' | 'active' | 'completed' | 'cancelled'
export type DaoStatus = 'pending_vote' | 'approved' | 'rejected'
export type MilestoneStatus = 'pending' | 'in_review' | 'approved' | 'paid'

export interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
    website: string | null
    user_role: UserRole
    reputation_score: number
    university_id: number | null
    updated_at: string
}

export interface University {
    id: number
    name: string
    website: string | null
    is_verified: boolean
    created_at: string
}

export interface Project {
    id: number
    researcher_id: string
    university_id: number
    title: string
    summary: string | null
    cover_image_url: string | null
    status: ProjectStatus
    funding_goal: number
    funds_raised: number
    created_at: string
    updated_at: string
}

export interface Proposal {
    id: number
    project_id: number
    proposal_document_url: string | null
    ipfs_hash: string | null
    ai_feasibility_score: number | null
    ai_market_potential_score: number | null
    ai_summary: string | null
    dao_status: DaoStatus
    created_at: string
}

export interface Milestone {
    id: number
    project_id: number
    title: string
    description: string | null
    funding_amount: number
    status: MilestoneStatus
    target_date: string | null
    verification_evidence_url: string | null
    created_at: string
}

export interface Investment {
    id: number
    project_id: number
    investor_id: string
    amount: number
    transaction_hash: string | null
    created_at: string
}
