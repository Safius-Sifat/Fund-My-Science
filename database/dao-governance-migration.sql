-- DAO Governance Migration
-- Add DAO voting system and blockchain integration fields
-- Run this in your Supabase SQL Editor

-- Create DAO Votes table for validator voting
CREATE TABLE public.dao_votes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    proposal_id BIGINT NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    validator_id UUID NOT NULL REFERENCES public.profiles(id),
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one vote per validator per proposal
    UNIQUE(proposal_id, validator_id)
);

ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DAO Votes
CREATE POLICY "DAO votes are viewable by everyone." ON public.dao_votes FOR SELECT USING (true);
CREATE POLICY "Validators can insert their own votes." ON public.dao_votes FOR INSERT WITH CHECK (
    auth.uid() = validator_id AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_role = 'validator'
    )
);
CREATE POLICY "Validators can update their own votes." ON public.dao_votes FOR UPDATE USING (
    auth.uid() = validator_id AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_role = 'validator'
    )
);

-- Add blockchain fields to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_project_id INTEGER;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ipfs_hash TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS proposal_document_url TEXT;

-- Add blockchain fields to investments table
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending';

-- Create function to update project funding (for blockchain sync)
CREATE OR REPLACE FUNCTION update_project_funding(project_id BIGINT, investment_amount NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE public.projects 
  SET funds_raised = funds_raised + investment_amount
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dao_votes_proposal_id ON public.dao_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dao_votes_validator_id ON public.dao_votes(validator_id);
CREATE INDEX IF NOT EXISTS idx_projects_blockchain_status ON public.projects(blockchain_status);
CREATE INDEX IF NOT EXISTS idx_projects_dao_status ON public.proposals(dao_status);

-- Create DAO governance statistics view
CREATE OR REPLACE VIEW public.dao_governance_stats AS
SELECT 
    p.id as proposal_id,
    p.project_id,
    pr.title as project_title,
    p.dao_status,
    COUNT(dv.id) as total_votes,
    COUNT(CASE WHEN dv.vote = 'approve' THEN 1 END) as approve_votes,
    COUNT(CASE WHEN dv.vote = 'reject' THEN 1 END) as reject_votes,
    p.created_at as proposal_created_at
FROM public.proposals p
LEFT JOIN public.dao_votes dv ON p.id = dv.proposal_id
LEFT JOIN public.projects pr ON p.project_id = pr.id
GROUP BY p.id, p.project_id, pr.title, p.dao_status, p.created_at;

-- Grant access to the view
GRANT SELECT ON public.dao_governance_stats TO authenticated;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE dao_votes;

-- Add notification function for new votes
CREATE OR REPLACE FUNCTION notify_dao_vote()
RETURNS TRIGGER AS $$
BEGIN
    -- You can add notifications here for real-time updates
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dao_vote_notification
    AFTER INSERT ON public.dao_votes
    FOR EACH ROW EXECUTE FUNCTION notify_dao_vote();

-- Comments for documentation
COMMENT ON TABLE public.dao_votes IS 'DAO voting system for project proposals';
COMMENT ON COLUMN public.projects.blockchain_project_id IS 'Project ID on the blockchain smart contract';
COMMENT ON COLUMN public.projects.blockchain_tx_hash IS 'Transaction hash when project was synced to blockchain';
COMMENT ON COLUMN public.projects.blockchain_status IS 'Blockchain sync status: pending, synced, failed';
COMMENT ON COLUMN public.projects.ipfs_hash IS 'IPFS hash for decentralized document storage';
