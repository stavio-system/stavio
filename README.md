<p align="center">
  <img src="./assets/ledgerloge.png" alt="Stavio" width="420" />
  <br/>
  <h1 align="center">Stavio</h1>
</p>

<p align="center">
  A fork and evolution of <a href="https://github.com/Stellar-Rent/stellar-rent">StellarRent</a> — rebranded, restructured, and extended as Stavio.
</p>

**Decentralized peer-to-peer property rentals powered by the Stellar blockchain.**

Stavio lets property owners list rentals and tenants pay securely with USDC. Payments are held in a TrustlessWork escrow smart contract and released only when rental conditions are met — no middlemen, no 7–20% platform fees, no 1–7 day settlement delays.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar)](https://stellar.org/)
[![Bun](https://img.shields.io/badge/runtime-Bun-orange?logo=bun)](https://bun.sh/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Smart Contracts](#smart-contracts)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Lineage](#lineage)
- [License](#license)

---

## Overview

Traditional rental platforms impose high fees, slow payments, and opaque processes. Stavio solves this by:

- **Escrow-protected payments** — USDC held in a Soroban smart contract, released on confirmation
- **Near-zero fees** — Stellar transactions cost ~$0.000001
- **3-second settlement** — No waiting 3–7 business days
- **Transparent ledger** — Every transaction is publicly verifiable on Stellar

### Current Status

Stavio is under active development targeting Stellar Testnet. Core flows implemented:

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

1. Tenant selects property and dates → BookingForm
2. Backend creates booking record + initiates TrustlessWork escrow
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
| Auth | Google OAuth (JWT decode) + Freighter wallet |
| Testing | Vitest (frontend), Bun test (backend), Playwright (e2e) |

---

## Project Structure

```
stavio/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # React hooks (auth, wallet, properties)
│   │   │   ├── services/       # API client (api.ts)
│   │   │   └── types/          # TypeScript types
│   │   └── stellar-social-sdk/ # Vendored Stellar auth SDK
│   │
│   ├── backend/                # Express + Bun API server
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── routes/         # Express routers
│   │   │   ├── middleware/     # Auth, rate limiting, error handling
│   │   │   └── config/         # Supabase, Redis setup
│   │   └── database/
│   │       └── migrations/     # SQL migration files
│   │
│   └── stellar-contracts/      # Soroban smart contracts (Rust)
│       └── contracts/
│           ├── booking/        # Booking lifecycle contract
│           ├── property-listing/ # Property registry contract
│           └── review-contract/  # On-chain review system
│
├── package.json                # Monorepo root (npm workspaces)
└── biome.json                  # Linting + formatting config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) (backend runtime) — `npm install -g bun`
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

Run the migrations in order against your Supabase project (SQL Editor):

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
# Server starts on http://localhost:3001
```

**3. Start the frontend:**

```bash
cd apps/web
npm run dev
# App starts on http://localhost:3000
```

**4. Open** [http://localhost:3000](http://localhost:3000)

> The frontend will fall back to mock property data if the backend is not running, so the UI is always functional locally.

---

## Smart Contracts

Located in `apps/stellar-contracts/contracts/`. Written in Rust using the [Soroban SDK](https://soroban.stellar.org/).

| Contract | Description |
|---|---|
| `booking` | Manages booking lifecycle: create, cancel, update status, escrow ID linking |
| `property-listing` | Property registry with paginated listing index and tamper-proof data hash |
| `review-contract` | On-chain reviews: submit, get by user, reputation scoring (1–5 stars) |

### Build contracts

```bash
cd apps/stellar-contracts
stellar contract build
```

### Run contract tests

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

Contributions are welcome. Please open an issue before submitting a large PR.

```bash
# Fork the repo, then:
git clone https://github.com/your-username/stavio
cd stavio
npm install --legacy-peer-deps

# Create a branch
git checkout -b feat/your-feature

# Make changes, then
git commit -m "feat: your feature description"
git push origin feat/your-feature
# Open a pull request
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## Lineage

Stavio is a fork of **[StellarRent](https://github.com/Stellar-Rent/stellar-rent)**, an open-source decentralized rental platform originally built by the StellarRent community on OnlyDust.

Key changes from the original:

- Rebranded from StellarRent → **Stavio**
- Auth system rewritten — working Google OAuth + Freighter wallet (original had stub implementations)
- `useProperties` wired to real backend API (original used mock data only)
- `BookingForm` fetches real property data (original had hardcoded "Luxury Beachfront Villa")
- `confirmBlockchainPayment` added to API client (original would crash at payment step)
- `profiles.stellar_address` DB column added (missing from original migrations)
- Reviews system added end-to-end (contract existed, no backend routes or frontend UI)
- Analytics endpoints built out (original returned zeros — endpoints didn't exist)
- `PropertyManagement` modals wired with controlled forms and submit handlers
- `get_all_listings` Soroban contract fixed — now uses a stored ID index with pagination
- Messages page rebuilt from placeholder to functional chat UI
- Hero section, Navbar, PropertyCard, SearchBar redesigned with unified light blue theme
- Right sidebar navigation replaced with standard top navbar

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).

---

Built on [Stellar](https://stellar.org/) · Escrow by [TrustlessWork](https://trustlesswork.com/) · Originally forked from [StellarRent](https://github.com/Stellar-Rent/stellar-rent)
