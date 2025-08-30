-- FundMyScience Database Schema
-- This file contains the complete database schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Realtime for live updates in the app
alter publication supabase_realtime add table profiles, universities, projects, proposals, milestones, investments;

-- Universities Table
-- Stores accredited universities that can submit proposals.
CREATE TABLE public.universities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Universities
CREATE POLICY "Universities are viewable by everyone." ON public.universities FOR SELECT USING (true);
-- Add policies for admin roles to insert/update universities

-- Profiles Table
-- Stores public user information, linked to Supabase's auth.users table.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    -- User roles: 'researcher', 'investor', 'validator', 'admin'
    user_role TEXT NOT NULL DEFAULT 'investor',
    reputation_score INT DEFAULT 0,
    university_id BIGINT REFERENCES public.universities(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects Table
-- Main table for research projects.
CREATE TABLE public.projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    researcher_id UUID NOT NULL REFERENCES public.profiles(id),
    university_id BIGINT NOT NULL REFERENCES public.universities(id),
    title TEXT NOT NULL,
    summary TEXT,
    cover_image_url TEXT,
    -- Status: 'draft', 'pending_approval', 'active', 'completed', 'cancelled'
    status TEXT NOT NULL DEFAULT 'draft',
    funding_goal NUMERIC(20, 2) NOT NULL,
    funds_raised NUMERIC(20, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Projects
CREATE POLICY "Projects are viewable by everyone." ON public.projects FOR SELECT USING (true);
CREATE POLICY "Researchers can insert their own projects." ON public.projects FOR INSERT WITH CHECK (auth.uid() = researcher_id);
CREATE POLICY "Researchers can update their own projects." ON public.projects FOR UPDATE USING (auth.uid() = researcher_id);

-- Proposals Table
-- Linked to a project, contains detailed documents and AI vetting scores.
CREATE TABLE public.proposals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    proposal_document_url TEXT, -- Link to IPFS or Supabase Storage
    ipfs_hash TEXT,
    ai_feasibility_score FLOAT,
    ai_market_potential_score FLOAT,
    ai_summary TEXT,
    -- DAO status: 'pending_vote', 'approved', 'rejected'
    dao_status TEXT NOT NULL DEFAULT 'pending_vote',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Proposals
CREATE POLICY "Proposals are viewable by everyone." ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Project owners can insert proposals." ON public.proposals FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = project_id AND projects.researcher_id = auth.uid()
    )
);

-- Milestones Table
-- Tracks milestones for each project.
CREATE TABLE public.milestones (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    funding_amount NUMERIC(20, 2) NOT NULL,
    -- Status: 'pending', 'in_review', 'approved', 'paid'
    status TEXT NOT NULL DEFAULT 'pending',
    target_date DATE,
    verification_evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Milestones
CREATE POLICY "Milestones are viewable by everyone." ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Project owners can manage milestones." ON public.milestones FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = project_id AND projects.researcher_id = auth.uid()
    )
);

-- Investments Table
-- Tracks who invested in which project.
CREATE TABLE public.investments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id),
    investor_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(20, 2) NOT NULL,
    transaction_hash TEXT, -- Blockchain transaction hash
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Investments
CREATE POLICY "Investments are viewable by everyone." ON public.investments FOR SELECT USING (true);
CREATE POLICY "Investors can view their own investments." ON public.investments FOR SELECT USING (auth.uid() = investor_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample universities
INSERT INTO public.universities (name, website, is_verified) VALUES
('Massachusetts Institute of Technology', 'https://mit.edu', true),
('Stanford University', 'https://stanford.edu', true),
('Harvard University', 'https://harvard.edu', true),
('University of California, Berkeley', 'https://berkeley.edu', true),
('California Institute of Technology', 'https://caltech.edu', true),
('University of Oxford', 'https://ox.ac.uk', true),
('University of Cambridge', 'https://cam.ac.uk', true),
('ETH Zurich', 'https://ethz.ch', true);
