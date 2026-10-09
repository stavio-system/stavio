<h1 align="center">Stavio</h1>

<p align="center">
  <strong>Decentralized peer-to-peer property rentals powered by the Stellar blockchain.</strong>
</p>

<p align="center">
  Book and list properties. Pay instantly with USDC. Funds held in escrow — released only when rental conditions are met. No middlemen, no platform fees, no delays.
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar" alt="Stellar" />
  <img src="https://img.shields.io/badge/runtime-Bun-orange?logo=bun" alt="Bun" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Smart Contracts](#smart-contracts)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Traditional rental platforms charge 7–20% fees, hold funds for days, and operate as black boxes. Stavio removes all of that:

- **Escrow-protected payments** — USDC locked in a Soroban smart contract, released only on confirmed completion
- **Near-zero fees** — Stellar transactions cost ~$0.000001
- **3-second settlement** — No waiting 3–7 business days
- **Fully transparent** — Every transaction is publicly verifiable on the Stellar ledger

### Current Status

Stavio is actively developed on Stellar Testnet.

| Feature | Status |
|---|---|
| Property listing (frontend + backend) | ✅ Done |
| Property search & browse | ✅ Done |
| Booking form | ✅ Done |
| Freighter wallet auth | ✅ Done |
| Google OAuth login | ✅ Done |
| TrustlessWork escrow integration | ✅ Done |
| Payment confirmation flow | ✅ Done |
| Reviews system | ✅ Done |
| Host/tenant dashboards | ✅ Done |
| Messages/chat | 🔧 Frontend only |
| Smart contract deployment (testnet) | 🔧 In progress |
| Mainnet launch | 🔜 Planned |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│   Next.js 15 (React 18, Tailwind, Freighter Wallet)     │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│              Express + Bun Backend                      │
│   Auth │ Properties │ Bookings │ Reviews │ Analytics    │
└──────┬─────────────────────────────────────┬────────────┘
       │                                     │
┌──────▼──────┐                   ┌──────────▼───────────┐
│  Supabase   │                   │  Stellar Network      │
│  PostgreSQL │                   │  Soroban Contracts    │
│  Storage    │                   │  TrustlessWork Escrow │
│  Auth       │                   │  Horizon RPC          │
└─────────────┘                   └──────────────────────┘
```

### Core Payment Flow

1. Tenant selects property and dates → `BookingForm`
2. Backend creates booking record and initiates TrustlessWork escrow
3. Tenant connects Freighter wallet → signs USDC transfer to escrow
4. Backend confirms transaction hash on-chain
5. Host confirms rental completion → escrow releases funds to host

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 18, Tailwind CSS, shadcn/ui |
| Backend | Express.js, Bun runtime, Zod validation |
| Database | Supabase (PostgreSQL + Storage + RLS) |
| Cache | Redis |
| Blockchain | Stellar, Soroban smart contracts (Rust) |
| Payments | USDC on Stellar, TrustlessWork escrow API |
| Wallet | Freighter browser extension |
| Auth | Google OAuth (JWT) + Freighter wallet |
| Testing | Vitest (frontend), Bun test (backend), Playwright (e2e) |

---

## Project Structure

```
stavio/
├── apps/
│   ├── web/                      # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   ├── components/       # UI components
│   │   │   ├── hooks/            # React hooks (auth, wallet, properties)
│   │   │   ├── services/         # API client
│   │   │   └── types/            # TypeScript types
│   │   └── stellar-social-sdk/   # Vendored Stellar auth SDK
│   │
│   ├── backend/                  # Express + Bun API server
│   │   ├── src/
│   │   │   ├── controllers/      # Route handlers
│   │   │   ├── services/         # Business logic
│   │   │   ├── routes/           # Express routers
│   │   │   ├── middleware/       # Auth, rate limiting, error handling
│   │   │   └── config/           # Supabase, Redis setup
│   │   └── database/
│   │       └── migrations/       # SQL migration files
│   │
│   └── stellar-contracts/        # Soroban smart contracts (Rust)
│       └── contracts/
│           ├── booking/          # Booking lifecycle contract
│           ├── property-listing/ # Property registry contract
│           └── review-contract/  # On-chain review system
│
├── package.json                  # Monorepo root (Yarn workspaces)
└── biome.json                    # Linting + formatting config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) — `npm install -g bun`
- [Supabase](https://supabase.com/) project (free tier works)
- [Redis](https://redis.io/) instance (local or [Upstash](https://upstash.com/))
- [Freighter](https://freighter.app/) browser extension (for wallet auth)

### Environment Variables

**Backend** — copy `apps/backend/.env.example` to `apps/backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Frontend** — copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_CONTRACT_ID=CALZGCSB3P3WEBLW3QTF5Y4WEALEVTYUYBC7KBGQ266GDINT7U4E74KW
NEXT_PUBLIC_USDC_ISSUER_TESTNET=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

### Database Setup

Run migrations in order in your Supabase SQL Editor:

```
apps/backend/database/migrations/00001_initial_schema.sql
apps/backend/database/migrations/00002_add_booking_blockchain_fields.sql
apps/backend/database/migrations/00002_storage_and_rls.sql
apps/backend/database/migrations/00003_triggers.sql
apps/backend/database/migrations/00004_create_wallet_auth_tables.sql
apps/backend/database/migrations/00005_create_profile_table.sql
apps/backend/database/migrations/00006_add_atomic_functions.sql
apps/backend/database/migrations/00007_add_payment_constraints.sql
apps/backend/database/migrations/00008_add_stellar_address_to_profiles.sql
apps/backend/database/migrations/00009_create_reviews_table.sql
```

### Running Locally

**1. Install dependencies:**

```bash
npm install --legacy-peer-deps
```

**2. Start the backend:**

```bash
cd apps/backend
bun run dev
# Runs on http://localhost:3001
```

**3. Start the frontend:**

```bash
cd apps/web
npm run dev
# Runs on http://localhost:3000
```

**4. Open** [http://localhost:3000](http://localhost:3000)

> The frontend falls back to mock property data if the backend isn't running, so the UI works locally without a full setup.

---

## Smart Contracts

Located in `apps/stellar-contracts/contracts/`. Written in Rust using the [Soroban SDK](https://soroban.stellar.org/).

| Contract | Description |
|---|---|
| `booking` | Booking lifecycle: create, cancel, update status, escrow ID linking |
| `property-listing` | Property registry with paginated index and tamper-proof data hash |
| `review-contract` | On-chain reviews: submit, retrieve by user, reputation scoring (1–5 stars) |

**Build:**

```bash
cd apps/stellar-contracts
stellar contract build
```

**Test:**

```bash
cd apps/stellar-contracts
cargo test
```

---

## API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register with email + password |
| `POST` | `/auth/login` | — | Login, returns JWT |
| `GET` | `/api/properties` | — | Search/list properties |
| `GET` | `/api/properties/:id` | — | Get property by ID |
| `POST` | `/api/properties` | ✅ | Create property listing |
| `PUT` | `/api/properties/:id` | ✅ | Update property |
| `DELETE` | `/api/properties/:id` | ✅ | Delete property |
| `GET` | `/api/bookings` | ✅ | Get user bookings |
| `POST` | `/api/bookings` | ✅ | Create booking + escrow |
| `PUT` | `/api/bookings/:id/cancel` | ✅ | Cancel booking |
| `POST` | `/api/bookings/:id/confirm-payment` | ✅ | Confirm on-chain payment |
| `GET` | `/api/reviews?propertyId=` | — | Get reviews for property |
| `POST` | `/api/reviews` | ✅ | Submit a review |
| `GET` | `/api/analytics/overview` | ✅ | Dashboard stats |
| `GET` | `/api/analytics/earnings` | ✅ | Earnings analytics |
| `GET` | `/api/profile/:userId` | ✅ | Get user profile |
| `PUT` | `/api/profile/:userId` | ✅ | Update user profile |

---

## Contributing

Open an issue before submitting a large PR. Small fixes can go straight to a PR.

```bash
# Fork the repo, then:
git clone https://github.com/stavio-system/stavio
cd stavio
npm install --legacy-peer-deps

# Create a branch
git checkout -b feat/your-feature

# Commit and push
git commit -m "feat: your feature description"
git push origin feat/your-feature

# Open a pull request on GitHub
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).

---

<p align="center">
  Built on <a href="https://stellar.org/">Stellar</a> · Escrow by <a href="https://trustlesswork.com/">TrustlessWork</a>
</p>
