# Security Policy

## Supported Versions

Only the latest release on the `main` branch receives security fixes. Older versions are not patched.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older branches | ❌ |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.**

If you discover a security vulnerability in Stavio, report it responsibly by emailing:

**security@stavio.com**

Include as much of the following as possible:

- Type of vulnerability (e.g. SQL injection, XSS, auth bypass, smart contract exploit)
- Affected component (frontend, backend API, smart contract, escrow logic)
- Full file path(s) and line numbers of the relevant source code
- Step-by-step reproduction instructions
- Proof of concept or exploit code (if available)
- Potential impact and attack scenario

We will acknowledge your report within **48 hours** and aim to provide a fix timeline within **7 days** for critical issues.

---

## Scope

The following are **in scope** for security reports:

- Authentication and session management (`apps/web/src/hooks/auth/`, `apps/backend/src/routes/auth.routes.ts`)
- Booking and payment flows (`apps/backend/src/services/booking.service.ts`, `apps/backend/src/blockchain/trustlessWork.ts`)
- Soroban smart contracts (`apps/stellar-contracts/contracts/`)
- Escrow logic and USDC payment handling
- Supabase Row Level Security (RLS) policy bypasses
- JWT token forgery or privilege escalation
- API authorization (missing or bypassable `authenticateToken` middleware)
- Injection vulnerabilities in API inputs
- Sensitive data exposure in API responses

The following are **out of scope**:

- Vulnerabilities in third-party dependencies not introduced by this project
- Issues requiring physical access to a user's machine
- Social engineering attacks
- Denial of service (DoS/DDoS) via rate limiting exhaustion
- Self-XSS or issues that only affect the attacker's own account
- Bugs in the Stellar network or Soroban runtime itself

---

## Security Architecture

### Authentication

- Email/password auth uses bcrypt hashing (via `bcrypt` v5)
- Wallet auth uses Freighter's browser extension — private keys never leave the user's device
- Google OAuth uses standard JWT credential decoding — no server-side token storage
- JWTs are signed with `JWT_SECRET` and validated on every protected route via `authenticateToken` middleware
- Auth tokens are stored in `localStorage` — XSS mitigation relies on CSP headers and input sanitisation

### Payments & Escrow

- All USDC payments go through [TrustlessWork](https://trustlesswork.com/) escrow contracts on Stellar
- Funds are never held by Stavio servers — only by the Soroban escrow contract
- Payment confirmation requires a valid on-chain transaction hash verified against the Stellar ledger
- Booking creation uses an atomic database transaction with blockchain rollback on failure

### API Security

- Rate limiting applied globally and per-route (stricter limits on `/auth/*`)
- CORS restricted to known frontend origins
- All protected routes require a valid Bearer token
- Input validation via Zod schemas on all API endpoints
- Supabase RLS enforces row-level access control on all database tables

### Smart Contracts

- Owner authorization (`owner.require_auth()`) enforced on all state-mutating contract functions
- Booking status transitions follow a strict finite state machine
- Escrow ID is set once and immutable after confirmation

---

## Disclosure Policy

We follow **coordinated disclosure**:

1. You report the vulnerability privately
2. We confirm receipt within 48 hours
3. We investigate and develop a fix
4. We release the fix and credit you in the changelog (unless you prefer to remain anonymous)
5. You may publicly disclose after the fix is released or after 90 days, whichever comes first

We will not pursue legal action against researchers who follow this policy in good faith.

---

## Known Limitations (Non-Critical)

The following are known limitations in the current development build, **not** vulnerabilities:

- Auth tokens stored in `localStorage` (HttpOnly cookies planned for production)
- Smart contracts deployed on **testnet only** — not audited for mainnet
- The vendored `stellar-social-sdk` has broken imports and is bypassed — its code is not executed
- Analytics endpoints use the authenticated user's ID from JWT, not a validated query param

---

## Contact

| Channel | Address |
|---------|---------|
| Security email | security@stavio.com |
| General contact | support@stavio.com |
| Telegram (community) | https://t.me/stellarentdevs |

---

_This policy is adapted from the [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories) best practices template._
