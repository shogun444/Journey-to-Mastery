# stXLM — Liquid Staking Vault for Stellar

[![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)

A liquid staking protocol on Stellar Testnet. Stake XLM and receive stXLM, a yield-bearing receipt token. Inspired by the ERC-4626 tokenized vault standard, built on Soroban smart contracts.

## Demo

- **Live demo:** [https://stxlm.vercel.app](https://stxlm.vercel.app)
- **Demo video:** [Watch walkthrough](https://youtu.be/YOUR_VIDEO_ID)

## Architecture

Two Soroban contracts with cross-contract calls:

- **stXLM Token** (`contracts/st-xlm/`) — SEP-41 fungible token with mint/burn authority restricted to the vault
- **Vault** (`contracts/vault/`) — ERC-4626-inspired vault with deposit, withdraw, exchange rate, fee model, pause/unpause, and mock yield simulation

### Events

| Event | Topics | Description |
|-------|--------|-------------|
| `Deposited` | `deposited` | Emitted on XLM deposit |
| `Withdrawn` | `withdrawn` | Emitted on stXLM withdrawal |
| `ExchangeRateUpdated` | `exchange_rate_updated` | Emitted after any state change |
| `FeeUpdated` | `fee_updated` | Emitted on fee parameter change |
| `TreasuryUpdated` | `treasury_updated` | Emitted on treasury address change |
| `Paused` | `paused` | Emitted when vault is paused |
| `Unpaused` | `unpaused` | Emitted when vault is unpaused |
| `YieldSimulated` | `yield_simulated` | Emitted on mock yield simulation |

### Exchange Rate Model (ERC-4626)

```
shares = (assets × total_supply) / total_assets
assets = (shares × total_assets) / total_supply
rate   = total_assets / total_supply
```

## Deployed Contracts (Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **stXLM Token** | `CDLVFCJFKYQX4LO2CUVAWF3A5ENHNX3K6552KRFDEF36IIHORDEIVO7W` | [View](https://stellar.expert/explorer/testnet/contract/CDLVFCJFKYQX4LO2CUVAWF3A5ENHNX3K6552KRFDEF36IIHORDEIVO7W) |
| **Vault** | `CBJHCW2ENU2TEGY6CNCFKRR4UZL6K7XUT3SS3O55NCKBK4IVRDUXXAJS` | [View](https://stellar.expert/explorer/testnet/contract/CBJHCW2ENU2TEGY6CNCFKRR4UZL6K7XUT3SS3O55NCKBK4IVRDUXXAJS) |

## Confirmed On-Chain Transactions

| Type | Amount | Hash | Explorer |
|------|--------|------|----------|
| Deposit | 12 XLM → 12 stXLM | `1f98ec47a42ad38c77667225f58b0fd760fb0c77a7d3feecc608cd6880e560d5` | [View](https://stellar.expert/explorer/testnet/tx/1f98ec47a42ad38c77667225f58b0fd760fb0c77a7d3feecc608cd6880e560d5) |
| Withdraw | 2 stXLM → 2 XLM | `32e96e380e342d9d801dd246d4cf8562cae0faf869f8fff05b9e0c73c341b831` | [View](https://stellar.expert/explorer/testnet/tx/32e96e380e342d9d801dd246d4cf8562cae0faf869f8fff05b9e0c73c341b831) |

## Screenshots

| Dashboard | Stake | Analytics |
|-----------|-------|-----------|
| ![Dashboard](screenshots/dashboard.png) | ![Stake](screenshots/stake.png) | ![Analytics](screenshots/analytics.png) |

| Transactions | Mobile Dashboard | Mobile Stake |
|-------------|-----------------|--------------|
| ![Transactions](screenshots/transactions.png) | ![Mobile Dashboard](screenshots/mobile-dashboard.png) | ![Mobile Stake](screenshots/mobile-stake.png) |

## Frontend

Next.js 16 (App Router), Tailwind CSS v4, motion/react, Stellar Wallets Kit (Freighter, LOBSTR, xBull, Albedo, Rabet, Hana).

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Portfolio overview with XLM/stXLM balances and exchange rate |
| Stake | `/stake` | Deposit XLM, preview stXLM shares, optimistic UI |
| Unstake | `/unstake` | Burn stXLM, preview XLM payout, optimistic UI |
| Analytics | `/analytics` | Protocol metrics: TVL, APY, total supply, exchange rate history, activity chart |
| Transactions | `/transactions` | On-chain transaction history from Horizon + Soroban events |

### Key Features

- **Multi-wallet:** 6 Stellar wallets via Stellar Wallets Kit
- **Event-driven refresh:** Soroban `getEvents()` polling detects Deposited/Withdrawn → instant re-fetch
- **Optimistic UI:** Balance updates immediately on submit, reverts on failure
- **On-chain analytics:** Chart data derived from real vault events, not localStorage-only
- **Live exchange rate:** A `useLiveMarket` hook streams a real-time fluctuating stXLM/XLM rate (orbiting the on-chain `exchange_rate()`) so every display — dashboard, stake/unstake, analytics stats, portfolio, and rate history — reflects the current price instead of a hardcoded 1:1
- **Deduplicated series:** `lib/analytics.ts` computes all chart series from a single source of truth and `dedupeConsecutive` collapses repeated points, so the rate history shows a clean `HH:MM:SS` progression instead of stacked "Now" labels
- **Mobile responsive:** Hamburger menu, responsive grids, mobile-optimized transaction rows
- **Dark mode:** Zinc-based dark color scheme

## Getting Started

```bash
cd apps/level-3
npm install
cp .env.example .env.local
npm run dev
```

Opens at [http://localhost:3002](http://localhost:3002).

## Smart Contracts

### Build

```bash
cd contracts/st-xlm
cargo build --target wasm32v1-none --release
cd ../vault
cargo build --target wasm32v1-none --release
```

### Test

```bash
cd contracts/st-xlm && cargo test
cd contracts/vault && cargo test
```

10 contract tests pass (6 vault + 4 token).

### Deploy

See `docs/deployment.md`.

## Documentation

- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [Tokenomics](docs/tokenomics.md)
- [Math](docs/math.md)
- [Roadmap](docs/roadmap.md)
- [Deployment](docs/deployment.md)

## CI/CD Pipeline

```
Format (Rust) → Clippy → Cargo Test → WASM Build → Lint → TypeScript Check → Vitest → Next Build
```

Runs on every push to `main` and on pull requests.

## Network

Testnet only. Yield is simulated via `simulate_yield()` because testnet XLM has no real value. The vault is designed with a yield adapter interface for future production strategies (Blend, Soroswap, etc.).
