# Architecture

## Overview

stXLM is a liquid staking vault on Stellar, inspired by the ERC-4626 tokenized vault standard and adapted for Soroban using SEP-41 fungible tokens and cross-contract asset accounting.

## Contract Architecture

```
User (Freighter/LOBSTR/xBull/etc.)
    │
    ├── deposit(XLM) ──────────► Vault Contract ──mint()──► stXLM Token
    │                                   │
    │                                   ├── transfer XLM to vault (via SAC)
    │                                   ├── calculate shares (ERC-4626)
    │                                   └── emit Deposited event
    │
    ├── withdraw(shares) ───────► Vault Contract ──burn()──► stXLM Token
    │                                   │
    │                                   ├── burn stXLM (via stXLM token)
    │                                   ├── transfer XLM from vault (via SAC)
    │                                   ├── send fee to treasury
    │                                   └── emit Withdrawn event
    │
    └── simulate_yield(amount) ─► Vault Contract (admin only)
                                        │
                                        ├── transfer XLM from admin to vault
                                        ├── update exchange rate
                                        └── emit YieldSimulated event
```

## Component Architecture (Frontend)

```
pages:
  / (Dashboard)      → portfolio overview, XLM/stXLM balances, exchange rate
  /stake             → deposit form with preview
  /unstake           → withdraw form with preview
  /analytics         → TVL, APY, total supply, exchange rate, stakers, revenue
  /transactions      → history table

providers:
  WalletProvider     → Stellar Wallets Kit (Freighter, LOBSTR, xBull, Albedo, Rabet, Hana)

hooks:
  useStellarWallet   → connect/disconnect/sign
  useBalance         → XLM + stXLM balance via Horizon
  useVault           → vault state, exchange rate, previews
  useStake           → deposit/withdraw flow
  useTransactionStatus → polling-based tx tracking
```

## Data Flow

### Deposit
1. User enters XLM amount
2. Frontend calls `preview_deposit(assets)` on vault contract
3. Vault returns expected stXLM shares
4. User confirms → `deposit(sender, assets)` is called
5. Vault requires auth from sender
6. Vault transfers XLM from sender to vault (via SAC `transfer`)
7. Vault mints stXLM to sender (via stXLM `mint`)
8. Event emitted: `Deposited(sender, assets, shares)`

### Withdraw
1. User enters stXLM amount
2. Frontend calls `preview_withdraw(shares)` on vault contract
3. Vault returns expected XLM amount (minus fees)
4. User confirms → `withdraw(sender, shares)` is called
5. Vault requires auth from sender
6. Vault burns stXLM from sender (via stXLM `burn`)
7. Vault transfers XLM from vault to sender (via SAC `transfer`)
8. If fee > 0, fee portion sent to treasury
9. Event emitted: `Withdrawn(sender, shares, assets)`

### Exchange Rate
- `exchange_rate()` returns `(numerator, denominator)` = `(total_assets, total_supply)`
- Exchange rate updates on every deposit, withdraw, and yield simulation
- Rate increases as yield accrues (more XLM in vault per stXLM)

## Mock Yield
- On testnet, yield is simulated via `simulate_yield(amount)` (admin only)
- Admin transfers XLM directly to vault, increasing total_assets without minting new stXLM
- This increases the exchange rate (1 stXLM becomes worth more XLM)
- In production, a real yield strategy (Blend lending, DEX liquidity) would replace this

## Key Design Decisions
- **Mock yield** — testnet XLM has no real value; honest, demoable, extensible
- **Yield Adapter pattern** — vault never needs rewriting; swap strategy module later
- **Two contracts** — vault + stXLM token, not three (no separate yield strategy contract)
- **ERC-4626 math** — simpler than reward claiming; industry standard
