# FundMyScience - Decentralized Research Funding Platform

A blockchain-powered platform connecting researchers with investors through milestone-based funding and AI-powered proposal vetting.

## Project Status

### ✅ Phase 1: Project Setup & Backend Configuration (COMPLETED)
### ✅ Phase 2: User Authentication & Profiles (COMPLETED)  
### ✅ Phase 3: Core Project Features (COMPLETED)
### 🚀 Phase 5: Blockchain Integration (IN PROGRESS)

#### What We're Building in Phase 5:

1. **Smart Contract Integration**
   - Ethereum smart contracts for transparent funding
   - Milestone-based fund release mechanism
   - Investor protection through blockchain escrow
   - Immutable project and funding records

2. **Web3 Wallet Integration**
   - MetaMask wallet connection
   - Multi-network support (localhost, Sepolia, mainnet)
   - Transaction signing and confirmation
   - Account management and switching

3. **Hybrid Architecture**
   - Supabase for fast UX and complex queries
   - Blockchain for transparency and immutability
   - Automatic synchronization between systems
   - Offline-first with blockchain sync

4. **Investment & Funding**
   - ETH-based investments with smart contract escrow
   - Automatic fund release upon milestone completion
   - Platform fee collection
   - Investment tracking and portfolio management

5. **Milestone Verification**
   - On-chain evidence submission
   - Validator approval system
   - Automated fund release
   - Immutable completion records

#### Current Implementation Status:
- ✅ Smart contract deployed (FundMyScience.sol)
- ✅ Web3Context with ethers.js integration
- ✅ Wallet connection component
- ✅ Blockchain synchronization utilities
- ✅ Local development environment setup
- 🔄 Testing framework and deployment guides
- ⏳ Production deployment to testnet
- ⏳ IPFS integration for document storage
- ⏳ DAO voting mechanism for project approval

#### What We've Built in Phase 3:

1. **Project Submission System**
   - Complete project creation form with file uploads
   - Cover image and proposal document upload to Supabase Storage
   - Milestone planning and funding goal setting
   - University validation for researchers

2. **Project Listing & Discovery**
   - Public project browsing with search and filters
   - Project status filtering (active, completed, etc.)
   - Responsive grid layout with project cards
   - Funding progress visualization

3. **Project Management**
   - "My Projects" dashboard for researchers
   - Project editing capabilities (for draft projects)
   - Real-time funding progress tracking
   - Milestone management interface

4. **Investment System**
   - Investment modal with validation
   - Funding progress tracking
   - Investor portfolio management
   - Transaction recording (ready for blockchain)

5. **File Upload & Storage**
   - Supabase Storage integration
   - Secure file upload with user-based access
   - Cover image handling and display
   - Proposal document management

6. **Enhanced Dashboards**
   - Role-specific dashboards with real data
   - Statistics and metrics for each user type
   - Quick actions tailored to user roles
   - Investment tracking and portfolio views

## Features Implemented

### 🔐 **Authentication & Users**
- Complete signup/login with role selection
- Profile management with university affiliation
- Role-based access control (Researcher/Investor/Validator)
- Reputation scoring system

### 📊 **Project Management**
- Project creation with milestones
- File upload (cover images, proposals)
- Project status management
- Funding goal and progress tracking

### 💰 **Investment Features**
- Investment modal with validation
- Portfolio tracking for investors
- Transaction recording
- ROI calculations

### 🗄️ **Database & Storage**
- Complete PostgreSQL schema
- Supabase Storage for files
- Row Level Security (RLS)
- Real-time data updates

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd fund-my-science
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Database Setup**
   - Create a new Supabase project
   - Run the SQL scripts in order:
     1. `database/schema.sql` (main database schema)
     2. `database/universities-data.sql` (university data)
     3. `database/profile-function-update.sql` (profile function)
     4. `database/storage-setup.sql` (storage buckets and policies)

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Core Tables:
- **profiles** - User information and roles
- **universities** - Accredited institutions (40+ included)
- **projects** - Research projects with funding goals
- **proposals** - Project proposals with AI scores
- **milestones** - Project milestones and funding tranches
- **investments** - Investment tracking and transactions

### Storage Buckets:
- **project-covers** - Project cover images
- **proposals** - Proposal documents and files

## User Journey

### For Researchers:
1. **Sign Up** → Select "Researcher" role → Choose university
2. **Create Project** → Upload cover image → Add milestones → Submit proposal
3. **Manage Projects** → Track funding → Update milestones
4. **Receive Funding** → Complete milestones → Receive payments

### For Investors:
1. **Sign Up** → Select "Investor" role
2. **Browse Projects** → Use filters → Review proposals
3. **Invest** → Choose amount → Complete transaction
4. **Track Portfolio** → Monitor ROI → View project progress

## Next Phases

### 🤖 Phase 4: AI Vetting Integration (UPCOMING)
- Supabase Edge Functions for AI calls
- OpenAI/Gemini API integration
- Automated proposal scoring
- AI summary generation

### ⛓️ Phase 5: Blockchain Integration (UPCOMING)
- Smart contract development (Solidity)
- Wallet connection (MetaMask)
- Escrow system for funds
- Milestone-based automatic payments

### 🏛️ Phase 6: DAO Governance (UPCOMING)
- Governance token system
- Proposal voting mechanisms
- Validator rewards
- Community governance

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Database**: PostgreSQL with Row Level Security
- **Storage**: Supabase Storage (instead of IPFS)
- **Security**: Content Security Policy (CSP), Security Headers
- **Future**: Polygon blockchain, Solidity smart contracts

## Security Features

### Content Security Policy (CSP)
The platform implements comprehensive CSP to prevent XSS and injection attacks:
- Development mode allows `eval` for hot reloading
- Production mode uses strict policies
- Automatic Supabase domain whitelisting
- CSP violation reporting in development

For detailed CSP configuration, see [CSP Configuration Guide](docs/CSP-CONFIGURATION.md).

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing  
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer info

## Project Structure

```
src/
├── app/
│   ├── auth/                # Authentication pages
│   ├── projects/           # Project management
│   │   ├── create/         # Project creation
│   │   ├── my/            # Researcher's projects
│   │   └── [id]/          # Project details
│   ├── dashboard/          # User dashboards
│   ├── profile/           # Profile management
│   └── investments/       # Investor portfolio
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   └── InvestmentModal.tsx # Investment interface
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── lib/                 # Utilities and config
│   ├── supabase.ts      # Supabase client and types
│   └── storage.ts       # File upload utilities
└── types/               # TypeScript definitions

database/
├── schema.sql                    # Main database schema
├── universities-data.sql         # University data
├── profile-function-update.sql   # Profile functions
└── storage-setup.sql            # Storage configuration
```

## Contributing

This project demonstrates a complete Web3 funding platform implementation. Each phase builds upon the previous one, creating a production-ready decentralized research funding platform.

## Demo Features

- 🎯 **Complete user authentication** with role-based access
- 📝 **Full project lifecycle** from creation to funding
- 💾 **File upload system** with Supabase Storage
- 📊 **Real-time dashboards** with actual data
- 💰 **Investment system** ready for blockchain integration
- 🔍 **Advanced search and filtering** for project discovery

## License

MIT License - see LICENSE file for details.
