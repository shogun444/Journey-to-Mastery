# stXLM — Liquid Staking Vault for Stellar

A liquid staking protocol on Stellar Testnet. Stake XLM and receive stXLM, a yield-bearing receipt token. Inspired by the ERC-4626 tokenized vault standard, built on Soroban smart contracts.

## Architecture

Two Soroban contracts:

- **stXLM Token** (`contracts/st-xlm/`) — SEP-41 fungible token with mint/burn authority restricted to the vault
- **Vault** (`contracts/vault/`) — ERC-4626-inspired vault with deposit, withdraw, exchange rate, fees, pause/unpause, and mock yield simulation

Deployed on testnet:
- stXLM: `CDLVFCJFKYQX4LO2CUVAWF3A5ENHNX3K6552KRFDEF36IIHORDEIVO7W`
- Vault: `CBJHCW2ENU2TEGY6CNCFKRR4UZL6K7XUT3SS3O55NCKBK4IVRDUXXAJS`

## Frontend

Next.js 16 (App Router), Tailwind CSS v4, motion/react, Stellar Wallets Kit (6 wallets).

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Portfolio overview with XLM/stXLM balances and exchange rate |
| Stake | `/stake` | Deposit XLM, preview stXLM shares |
| Unstake | `/unstake` | Burn stXLM, preview XLM payout |
| Analytics | `/analytics` | TVL, APY, total supply, exchange rate, stakers |
| Transactions | `/transactions` | Transaction history |

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
cd contracts/st-xlm && cargo build --target wasm32v1-none --release
cd ../vault && cargo build --target wasm32v1-none --release
```

### Test

```bash
cd contracts/st-xlm && cargo test
cd contracts/vault && cargo test
```

### Deploy

See `docs/deployment.md`.

## Documentation

- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [Tokenomics](docs/tokenomics.md)
- [Math](docs/math.md)
- [Roadmap](docs/roadmap.md)
- [Deployment](docs/deployment.md)

## Confirmed Transactions

| Type | Hash | Explorer |
|------|------|----------|
| Deposit (12 XLM → 12 stXLM) | `1f98ec47a42ad38c77667225f58b0fd760fb0c77a7d3feecc608cd6880e560d5` | [View](https://stellar.expert/explorer/testnet/tx/1f98ec47a42ad38c77667225f58b0fd760fb0c77a7d3feecc608cd6880e560d5) |
| Withdraw (2 stXLM → 2 XLM) | `32e96e380e342d9d801dd246d4cf8562cae0faf869f8fff05b9e0c73c341b831` | [View](https://stellar.expert/explorer/testnet/tx/32e96e380e342d9d801dd246d4cf8562cae0faf869f8fff05b9e0c73c341b831) |

## Network

Testnet only. Yield is simulated via `simulate_yield()` because testnet XLM has no real value. The vault is designed with a yield adapter interface for future production strategies (Blend, Soroswap, etc.).

## CI/CD

Format -> Clippy -> Cargo Test -> Lint -> TypeScript Check -> Build.
