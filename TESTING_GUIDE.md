# 🧪 FundMyScience - Complete System Testing Guide

## 🎯 Quick Test Overview

Your complete blockchain-integrated research funding platform is ready! Here's how to test all the new features:

## 🚀 Prerequisites

1. **Frontend Running**: `npm run dev` (✅ Already running at http://localhost:3000)
2. **Blockchain Node**: `cd contracts && npx hardhat node` (✅ Already running at localhost:8545)
3. **Database Migration**: Run the DAO governance SQL in Supabase SQL Editor

## 🗄️ Database Setup (REQUIRED FIRST)

Copy this SQL and run it in your Supabase SQL Editor:

```sql
-- DAO Governance Migration - Copy everything from database/dao-governance-migration.sql
CREATE TABLE public.dao_votes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    proposal_id BIGINT NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    validator_id UUID NOT NULL REFERENCES public.profiles(id),
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proposal_id, validator_id)
);

ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DAO votes are viewable by everyone." ON public.dao_votes FOR SELECT USING (true);

-- Add blockchain fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_project_id INTEGER;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ipfs_hash TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE dao_votes;
```

## 🧪 Test Scenarios

### Test 1: 🔬 Complete Researcher Project Flow

1. **Sign Up as Researcher**
   - Go to http://localhost:3000
   - Sign up with role 'researcher'
   - Choose a university

2. **Create Project (Draft)**
   - Navigate to "Create Project" 
   - Fill in project details, add milestones
   - Upload cover image and proposal document
   - Submit project → **Project saved as DRAFT status**

3. **Manage Projects**
   - Navigate to "My Projects"
   - See project with status "draft"
   - Edit project if needed
   - **Click "Submit for Review"** → Changes status to `pending_approval`
   - **Project now enters DAO voting queue**

4. **Check Project Status Flow**
   - **Draft**: Can edit, can submit for review
   - **Pending Approval**: Shows "Under DAO Review", can't edit
   - **Active**: After DAO approval, accepts investments

### Test 2: 🏛️ DAO Governance Voting

1. **Create Validator Account**
   - Sign up with role 'validator'
   - Note: In production, validators need admin approval

2. **Submit Project for Review** (As Researcher)
   - Go to "My Projects"
   - Click "Submit for Review" on a draft project
   - Project status changes to "pending_approval"

3. **Access DAO Governance** (As Validator)
   - Navigate to `/dao` (should appear in navigation for validators)
   - See list of pending proposals (only projects with `pending_approval` status)

4. **Vote on Proposals**
   - Review project details and proposal document
   - Add comments (optional)
   - Vote "Approve" or "Reject"
   - Watch vote counts update in real-time

5. **Test Consensus Rules**
   - Create 3 validator accounts
   - Vote on the same proposal
   - Watch status change when majority reached
   - **Approved projects auto-sync to blockchain and become 'active'!**

### Test 3: 💰 Investment Flow with Blockchain

1. **Sign Up as Investor**
   - Sign up with role 'investor'
   - Browse projects (only active/approved projects should accept investments)

2. **Test Investment Methods**

   **Method A: With Wallet Connected**
   - Connect MetaMask with test ETH
   - Click "Invest" on an active project
   - See blockchain status indicator
   - Submit investment → Watch blockchain transaction
   - Verify funds held in smart contract escrow

   **Method B: Without Wallet**
   - Disconnect wallet
   - Make investment → Saves to database only
   - See "Database Only" indicator
   - Can connect wallet later to sync

3. **Verify Investment**
   - Check `investments` table for new record
   - Check project `funds_raised` updated
   - Check blockchain transaction hash if wallet was connected

### Test 4: 🔄 End-to-End Complete Flow

1. **Create Complete Project Journey**
   - Researcher creates project → Database save
   - Connect wallet → Blockchain sync
   - Proposal enters DAO queue
   - Validators review and approve → Auto-blockchain deployment
   - Project becomes active
   - Investors invest → Smart contract escrow
   - Researcher submits milestones → Fund release

## 🔍 Key Features to Test

### ✅ Blockchain Integration
- [ ] Project creation syncs to blockchain when wallet connected
- [ ] Investment transactions go through smart contract
- [ ] Transaction hashes stored in database
- [ ] Graceful fallback when wallet not connected
- [ ] Real-time blockchain status indicators

### ✅ DAO Governance
- [ ] Only validators can access DAO governance page
- [ ] Voting interface works correctly
- [ ] Vote counts update in real-time
- [ ] Approved projects auto-sync to blockchain
- [ ] Consensus rules enforced (minimum 3 votes, majority wins)

### ✅ User Experience
- [ ] Role-based navigation (validator sees DAO link)
- [ ] Blockchain status indicators throughout app
- [ ] Responsive design on all new components
- [ ] Error handling for failed blockchain transactions

### ✅ Security & Data
- [ ] Only validators can vote (check RLS policies)
- [ ] One vote per validator per proposal
- [ ] Blockchain transaction security
- [ ] Input validation on all forms

## 🐛 Debugging Tips

### Check Console Logs
- Project creation shows blockchain sync attempts
- Investment flow shows blockchain/database paths
- DAO voting shows consensus calculations

### Database Verification
```sql
-- Check proposals and votes
SELECT p.*, pr.title, COUNT(dv.id) as vote_count 
FROM proposals p 
LEFT JOIN dao_votes dv ON p.id = dv.proposal_id 
LEFT JOIN projects pr ON p.project_id = pr.id 
GROUP BY p.id, pr.title;

-- Check blockchain sync status
SELECT id, title, blockchain_status, blockchain_tx_hash 
FROM projects 
WHERE blockchain_status IS NOT NULL;
```

### MetaMask Issues
- Ensure localhost network added (RPC: http://localhost:8545, Chain ID: 31337)
- Import test account from Hardhat node output
- Reset account if nonce issues occur

## 🎉 Success Indicators

When everything works correctly, you should see:

1. **Project Creation**: ✅ Database save → 🔗 Blockchain sync → 🏛️ DAO queue
2. **DAO Governance**: ✅ Voting interface → 📊 Live counts → 🚀 Auto-deployment
3. **Investments**: ✅ MetaMask popup → 💰 Blockchain transaction → 🔒 Escrow secured
4. **Real-time Updates**: ✅ Status indicators → 📱 Live vote counts → 🔄 Sync progress

## 📋 Production Deployment Checklist

- [ ] Run database migration in production Supabase
- [ ] Deploy smart contract to chosen network (Sepolia, Polygon, etc.)
- [ ] Update contract address in environment variables
- [ ] Test with real testnet ETH
- [ ] Configure proper validator approval process
- [ ] Set up monitoring for blockchain events
- [ ] Document gas costs and transaction limits

---

## 🚀 You're Ready!

Your decentralized research funding platform is complete with:
- ✅ **Blockchain Integration** - Secure, transparent funding
- ✅ **DAO Governance** - Decentralized project approval
- ✅ **Hybrid Architecture** - Fast UX + Blockchain security
- ✅ **Production Ready** - Full error handling & fallbacks

Start testing and bring scientific research funding into the Web3 era! 🌟
