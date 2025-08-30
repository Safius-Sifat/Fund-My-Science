/**
 * Script to add sample projects to the database for testing
 * Run this in the browser console or as a Node.js script
 */

import { supabase } from '@/lib/supabase'

export async function createSampleProjects() {
    const sampleProjects = [
        {
            title: "Advanced Cancer Immunotherapy Research",
            summary: "Developing novel CAR-T cell therapies targeting multiple cancer pathways with enhanced safety profiles and improved efficacy against treatment-resistant tumors.",
            funding_goal: 150000,
            funds_raised: 112500,
            status: 'active' as const,
            university_id: 1,
            researcher_id: 'sample-researcher-1'
        },
        {
            title: "Next-Generation Solar Cell Technology",
            summary: "Revolutionary perovskite-silicon tandem solar cells achieving 35% efficiency, aimed at making renewable energy more accessible and cost-effective worldwide.",
            funding_goal: 200000,
            funds_raised: 200000,
            status: 'active' as const,
            university_id: 2,
            researcher_id: 'sample-researcher-2'
        },
        {
            title: "Portable Water Purification System",
            summary: "Low-cost, portable water purification device using advanced nanofiltration technology to provide clean drinking water in remote and disaster-affected communities.",
            funding_goal: 75000,
            funds_raised: 33750,
            status: 'active' as const,
            university_id: 3,
            researcher_id: 'sample-researcher-3'
        },
        {
            title: "AI-Powered Drug Discovery Platform",
            summary: "Machine learning platform for accelerating drug discovery by predicting molecular interactions and optimizing compound design for various therapeutic targets.",
            funding_goal: 300000,
            funds_raised: 45000,
            status: 'active' as const,
            university_id: 1,
            researcher_id: 'sample-researcher-4'
        },
        {
            title: "Biodegradable Plastic Alternatives",
            summary: "Developing sustainable, biodegradable plastic alternatives from agricultural waste that decompose completely within 90 days in marine environments.",
            funding_goal: 120000,
            funds_raised: 84000,
            status: 'active' as const,
            university_id: 4,
            researcher_id: 'sample-researcher-5'
        },
        {
            title: "Quantum Computing for Climate Modeling",
            summary: "Leveraging quantum computing algorithms to create more accurate climate prediction models for better understanding of global warming patterns.",
            funding_goal: 250000,
            funds_raised: 175000,
            status: 'active' as const,
            university_id: 2,
            researcher_id: 'sample-researcher-6'
        }
    ]

    try {
        // First, let's create sample researcher profiles
        const sampleProfiles = [
            { id: 'sample-researcher-1', full_name: 'Dr. Sarah Johnson', user_role: 'researcher' as const, reputation_score: 95, university_id: 1 },
            { id: 'sample-researcher-2', full_name: 'Dr. Michael Chen', user_role: 'researcher' as const, reputation_score: 88, university_id: 2 },
            { id: 'sample-researcher-3', full_name: 'Dr. Amara Okafor', user_role: 'researcher' as const, reputation_score: 92, university_id: 3 },
            { id: 'sample-researcher-4', full_name: 'Dr. Elena Rodriguez', user_role: 'researcher' as const, reputation_score: 90, university_id: 1 },
            { id: 'sample-researcher-5', full_name: 'Dr. James Liu', user_role: 'researcher' as const, reputation_score: 87, university_id: 4 },
            { id: 'sample-researcher-6', full_name: 'Dr. Priya Sharma', user_role: 'researcher' as const, reputation_score: 93, university_id: 2 }
        ]

        console.log('Creating sample profiles...')
        for (const profile of sampleProfiles) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profile)

            if (profileError) {
                console.error('Error creating profile:', profileError)
            }
        }

        console.log('Creating sample projects...')
        const { data, error } = await supabase
            .from('projects')
            .insert(sampleProjects)
            .select()

        if (error) {
            console.error('Error creating sample projects:', error)
            return null
        }

        console.log('Sample projects created successfully:', data)
        return data
    } catch (err) {
        console.error('Error:', err)
        return null
    }
}

export async function createSampleUniversities() {
    const universities = [
        { id: 1, name: 'Stanford University', website: 'https://stanford.edu', is_verified: true },
        { id: 2, name: 'Massachusetts Institute of Technology', website: 'https://mit.edu', is_verified: true },
        { id: 3, name: 'University of Oxford', website: 'https://ox.ac.uk', is_verified: true },
        { id: 4, name: 'University of California, Berkeley', website: 'https://berkeley.edu', is_verified: true }
    ]

    try {
        const { data, error } = await supabase
            .from('universities')
            .upsert(universities)
            .select()

        if (error) {
            console.error('Error creating universities:', error)
            return null
        }

        console.log('Universities created successfully:', data)
        return data
    } catch (err) {
        console.error('Error:', err)
        return null
    }
}

// Usage:
// await createSampleUniversities()
// await createSampleProjects()
