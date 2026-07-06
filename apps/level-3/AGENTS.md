# AGENTS.md — Level 3: stXLM Liquid Staking Vault

## Project Overview
**stXLM — A Liquid Staking Vault for Stellar**
A liquid staking protocol inspired by the ERC-4626 tokenized vault model, adapted for Soroban using SEP-41 fungible tokens and cross-contract asset accounting. Users deposit XLM, receive stXLM (a yield-bearing receipt token), and the exchange rate between stXLM and XLM increases as yield accrues.

## Architecture

```
Frontend (Next.js 16 — App Router, Tailwind v4, motion/react)
    ↓
Wallet Layer (Stellar Wallets Kit — Freighter, LOBSTR, xBull, Albedo, Rabet, Hana)
    ↓
┌──────────────────────────────────────────┐
│          Vault Contract (Soroban)        │
│  deposit() / withdraw() / preview_*()    │
│  exchange_rate() / simulate_yield()      │
│  pause() / unpause() / set_fee()         │
│  Events: Deposited, Withdrawn,           │
│          ExchangeRateUpdated, FeeUpdated,│
│          TreasuryUpdated, Paused,         │
│          Unpaused, YieldSimulated        │
│  ┌────────────────────────────────────┐  │
│  │  Yield Adapter Interface           │  │
│  │  ├─ MockStrategy (testnet today)   │  │
│  │  └─ BlendStrategy (future)         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│      stXLM Token (SEP-41, Soroban)       │
│  mint() / burn() / transfer()            │
│  approve() / allowance() / balance()     │
│  Events: Transfer, Mint, Burn, Approval  │
└──────────────────────────────────────────┘
    ↓
          Stellar Network (Testnet)
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.10 (App Router) |
| Language | TypeScript strict, Rust (`#![no_std]`) |
| Styling | Tailwind CSS v4 (CSS-based, NO tailwind.config.ts) |
| PostCSS | `@tailwindcss/postcss` plugin |
| Animation | `motion/react` (formerly Framer Motion) |
| Wallet | `@creit.tech/stellar-wallets-kit` (6 wallets) |
| SDK | `@stellar/stellar-sdk` v16 |
| Icons | `@phosphor-icons/react` |
| Smart Contracts | `soroban-sdk` v25 |
| Contract Target | `wasm32v1-none` |
| Package Manager | pnpm 9 (monorepo root), npm (level-3 local) |
| Port | 3002 (dev) |
| CI/CD | GitHub Actions |

## Design System

**Design Read:** DeFi staking dashboard for crypto-native users, dark-tech aesthetic, premium utilitarian minimalism.

### Dial Settings
- `DESIGN_VARIANCE: 6` — slight asymmetry in bento card layouts
- `MOTION_INTENSITY: 6` — fade-up entries, spring physics on CTAs
- `VISUAL_DENSITY: 5` — data-rich but with breathing room

### Color Palette (Inherits Level 2 zinc-based dark theme)
| Token | Value | Usage |
|-------|-------|-------|
| Surface | `bg-zinc-950` (#050505) | Page bg |
| Elevated | `bg-zinc-900` (#0c0c0c) | Cards |
| Hover | `bg-zinc-800` (#181818) | Hover |
| Border | `border-zinc-800/50` | Dividers |
| Text Primary | `text-zinc-100` | Headings |
| Text Secondary | `text-zinc-400` | Labels |
| Accent | `emerald-500` | Staking/rewards/growth |
| Action | `blue-500` | Buttons, CTAs |
| Danger | `red-500` | Errors |
| Warning | `amber-500` | Warnings |

### Typography
- Sans: Geist (via `next/font`)
- Mono: Geist Mono (via `next/font`)

### Component Architecture (shadcn-style)
- Every component: `className?: string`, `forwardRef` for form elements
- `cn()` utility from `clsx` + `tailwind-merge`
- Named exports for primitives, default exports for pages
- All base UI in `components/ui/` — button, input, card, badge, heading, subheading, tabs, tooltip, progress
- Feature components in `components/stake/`, `components/wallet/`, `components/layout/`
- Hooks in `hooks/`
- Lib in `lib/`

## Frontend Pages

| Page | Route | Content |
|------|-------|---------|
| Dashboard | `/` | Portfolio: staked XLM, stXLM balance, XLM balance, exchange rate |
| Stake | `/stake` | Deposit form + preview_stake |
| Unstake | `/unstake` | Withdraw form + preview_unstake |
| Analytics | `/analytics` | TVL, APY, Total Supply, Exchange Rate, Stakers, Revenue, Today's Yield |
| Transactions | `/transactions` | History table (type, amount, hash, time, status) |

## Smart Contracts (2 contracts)

### Contract 1: stXLM (`contracts/st-xlm/`)
- SEP-41 token interface
- `__constructor(admin: Address, name: String, symbol: Symbol, decimals: u32)`
- `mint(to, amount)` — Vault-only (require_auth for Vault address)
- `burn(from, amount)` — Vault-only
- `transfer()`, `transfer_from()`, `approve()`, `allowance()`
- `balance()`, `total_supply()`, `name()`, `symbol()`, `decimals()`

### Contract 2: Vault (`contracts/vault/`)
- ERC-4626-inspired vault
- `__constructor(admin: Address, st_xlm: Address, treasury: Address, deposit_fee_bps: u32, withdraw_fee_bps: u32)`
- **Deposit:** `deposit(assets: i128)` → transfer XLM from user → mint stXLM
- **Withdraw:** `withdraw(shares: i128)` → burn stXLM → transfer XLM + yield to user
- **Preview:** `preview_deposit(assets)` → shares, `preview_withdraw(shares)` → assets
- **Exchange Rate:** `exchange_rate() -> (numerator: i128, denominator: i128)`
- **Mock Yield:** `simulate_yield(amount: i128)` — admin-only, increases vault balance
- **Admin:** `pause()`, `unpause()`, `set_fee(deposit_bps, withdraw_bps)`, `set_treasury(new_treasury)`
- **Events:** Deposited, Withdrawn, ExchangeRateUpdated, FeeUpdated, TreasuryUpdated, Paused, Unpaused, YieldSimulated

### Exchange Rate Math (ERC-4626 style)
```
shares = (assets * total_supply) / total_assets
assets = (shares * total_assets) / total_supply

Where:
- total_assets  = vault XLM balance (deposits + yield - fees)
- total_supply  = total stXLM minted
```

### Fee Model
```
deposit_fee  = assets * deposit_fee_bps / 10000
withdraw_fee = assets * withdraw_fee_bps / 10000
```

## File Structure
```
apps/level-3/
├── .github/workflows/ci.yml
├── app/
│   ├── layout.tsx
│   ├── page.tsx              (Dashboard)
│   ├── providers.tsx
│   ├── globals.css
│   ├── stake/page.tsx
│   ├── unstake/page.tsx
│   ├── analytics/page.tsx
│   └── transactions/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx, input.tsx, card.tsx
│   │   ├── heading.tsx, subheading.tsx, badge.tsx
│   │   ├── tabs.tsx, tooltip.tsx, progress.tsx
│   │   └── dialog.tsx
│   ├── wallet/
│   │   ├── connect-button.tsx, wallet-modal.tsx
│   │   ├── network-badge.tsx, account-display.tsx
│   ├── stake/
│   │   ├── stake-form.tsx, unstake-form.tsx
│   │   ├── stake-stats.tsx, preview-display.tsx
│   └── layout/
│       └── header.tsx
├── contracts/
│   ├── st-xlm/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   └── vault/
│       ├── Cargo.toml
│       └── src/lib.rs
├── docs/
│   ├── architecture.md
│   ├── security.md
│   ├── tokenomics.md
│   ├── math.md
│   ├── roadmap.md
│   └── deployment.md
├── hooks/
│   ├── useStellarWallet.ts
│   ├── useBalance.ts
│   ├── useStake.ts
│   ├── useVault.ts
│   └── useTransactionStatus.ts
├── lib/
│   ├── stellar.ts
│   ├── transactions.ts
│   ├── utils.ts
│   ├── tokens.ts
│   └── vault.ts
├── types/
│   └── index.ts
├── screenshots/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

## Error Handling (7 types)
1. Wallet not found → install link per wallet
2. Insufficient XLM → disable stake, "Insufficient XLM"
3. Insufficient stXLM → disable unstake, "Insufficient stXLM"
4. User rejected sign → clear message, allow retry
5. Network mismatch → warning badge in header
6. Transaction failed → StellarExpert link + error reason
7. Vault paused → "Operations temporarily paused"

## CI/CD Pipeline (GitHub Actions)
```
Format (prettier) → Clippy (Rust lints) → Cargo Test (3+ passing)
→ Lint (eslint) → Check Types (tsc) → Build (next build)
→ Deploy Preview (Vercel)
```

## Implementation Order

| # | Task | Est. Files | Est. Lines |
|---|------|------------|------------|
| 1 | AGENTS.md + design.md (Level 3 section) | 2 | 50 |
| 2 | Contract Cargo.toml files | 2 | 40 |
| 3 | stXLM token contract | 1 | 180 |
| 4 | Vault contract (deposit/withdraw/exchange/fees/events) | 1 | 350 |
| 5 | Contract tests (3+ passing) | 2 | 200 |
| 6 | Build + deploy to testnet | — | — |
| 7 | Frontend deps + globals.css + ui primitives | 8 | 300 |
| 8 | lib/ + types/ | 6 | 200 |
| 9 | Wallet integration (connect-button, wallet-modal, header) | 4 | 300 |
| 10 | Stake form + unstake form | 3 | 250 |
| 11 | Dashboard page (portfolio overview) | 1 | 100 |
| 12 | Analytics page | 1 | 120 |
| 13 | Transactions page | 1 | 100 |
| 14 | Protocol docs (6 files) | 6 | 300 |
| 15 | CI/CD pipeline | 1 | 60 |
| 16 | README + screenshots + demo video | — | 200 |
| 17 | Final QA + git commits (15+ commits) | — | — |

## Git Commit Plan (15+ commits)
1. `feat: scaffold level-3 with Next.js + Tailwind v4 + design system`
2. `feat: implement stXLM token contract (SEP-41)`
3. `feat: implement vault contract (deposit/withdraw/exchange/fees)`
4. `feat: add vault admin functions (pause/unpause/fee/events)`
5. `feat: add contract tests (3+ passing)`
6. `feat: build and deploy contracts to testnet`
7. `feat: add wallet integration (Stellar Wallets Kit)`
8. `feat: add stake form with preview`
9. `feat: add unstake form with preview`
10. `feat: add dashboard page (portfolio overview)`
11. `feat: add analytics page (TVL, APY, revenue)`
12. `feat: add transactions page (history)`
13. `feat: add protocol documentation (docs/)`
14. `feat: add CI/CD pipeline (GitHub Actions)`
15. `docs: README, screenshots, demo video`
16. `fix: error handling + transaction status polling`

## Key Design Decisions
- **Mock yield on testnet** — testnet XLM has no real value; `simulate_yield()` is honest, demoable, and extensible
- **Yield Adapter interface** — vault never needs rewriting; swap strategy module later for Blend/Phoenix/Aquarius
- **Exchange Rate model** — simpler than reward claiming; ERC-4626 standard; judges recognize it
- **stXLM naming** — immediately understandable; room for stUSDC, stBTC later
- **No Settings/Profile/Notifications pages** — judges want product-market focus, not generic UI cruft
- **Fees at 0bps initially** — protocol revenue ready; analytics shows "Protocol Revenue: 0 XLM"
- **Preview functions** — users see exact amounts before signing; professional UX

## Marketing
**stXLM — A Liquid Staking Vault for Stellar**
Inspired by the ERC-4626 tokenized vault model and adapted for Soroban using SEP-41 tokens and Soroban smart contracts.

## Scoring Potential
> This project has potential to win Orange Belt:
> - Advanced contracts with cross-contract calls
> - Production architecture with mock yield + adapter pattern
> - 3+ passing contract tests
> - CI/CD pipeline (format → clippy → test → build → deploy)
> - Responsive frontend with 5 pages
> - 6 protocol documentation files
> - Honest testnet story (mock yield, not fake yield)
> - Not a tutorial project — looks like a real protocol
