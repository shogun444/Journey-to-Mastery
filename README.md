# Stellar Journey to Mastery

A progressive learning path to master Stellar blockchain development. Three levels covering basic payments, token swaps, and liquid staking — each building on the last with increasing complexity.

## Repository Structure

```
Stellar-Journey-to-Mastery/
├── apps/
│   ├── level-1/       # Simple Payment dApp (White Belt)
│   ├── level-2/       # Token Swap Interface (Yellow Belt)
│   └── level-3/       # stXLM Liquid Staking Vault (Orange Belt)
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Levels

### Level 1: Simple Payment dApp (White Belt)

A minimal Stellar payment dApp on the Stellar testnet. Connect your Freighter wallet, view XLM balance, and send XLM to any Stellar address.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **@stellar/stellar-sdk**.

#### Features
- Freighter wallet connect / disconnect
- XLM balance display with auto-refresh
- Send XLM to any Stellar G... address
- Testnet Friendbot funding (10,000 free XLM)
- Transaction status tracking (build, sign, submit, confirm)
- View transaction on StellarExpert
- Dark / light mode toggle
- Form validation + error handling

#### Screenshots
| Step | Screenshot |
|------|------------|
| Testnet transaction of 34 XLM | ![Tx 34 XLM](apps/level-1/screenshots/transactions(Testnet).png) |
| Transaction on StellarExpert | ![StellarExpert](apps/level-1/screenshots/transactiononStellarExpert.png) |
| Successful transaction | ![Tx Confirmed](apps/level-1/screenshots/transactionConfirmed.png) |
| Transaction of 500 XLM with history | ![Tx 500](apps/level-1/screenshots/transactionHistoryWithBalanceAfterSucessfullTransactrion.png) |

#### Setup
```sh
cd apps/level-1
pnpm install
pnpm dev --filter=docs
```
Open [http://localhost:3001](http://localhost:3001).

#### Tech Stack
| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Wallet | @stellar/freighter-api |
| SDK | @stellar/stellar-sdk (Horizon) |
| Icons | @phosphor-icons/react |
| Animations | CSS transitions |
| Package manager | pnpm 9 |
| Dev port | 3001 |

---

### Level 2: Token Swap Interface (Yellow Belt)

A token swap dApp on the Stellar testnet. Multi-wallet support, DEX orderbook swaps via path payments, and high-end UI with Ethereal Glass design.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **@stellar/stellar-sdk**, **@creit.tech/stellar-wallets-kit**, and **motion/react**.

#### Features
- Multi-wallet support (Freighter, LOBSTR, xBull, Albedo, Rabet, Hana)
- Token balance display (XLM, USDC, Aqua, more)
- DEX orderbook integration via Horizon
- Path payment swaps with slippage protection
- Real-time swap rate display with orderbook depth
- Transaction status polling (pending, success, fail)
- Smart contract event emission (SwapExecuted)
- Premium Ethereal Glass UI design
- Dark / light mode
- Error handling (6+ types)

#### Smart Contract
Deployed AMM contract on Stellar testnet wrapping DEX path payments.

| Item | Value |
|------|-------|
| Contract ID | `CCKWIHACAVZC5OBGR7W2HL43KKOYYCL3XZJD5APOUFYBWMBS2FZXWYAF` |
| Deploy Tx | [View on StellarExpert](https://stellar.expert/explorer/testnet/tx/99eae42899d64d41f529e6ceeed98c1520b063d19a441fe3786c972d80953e27) |
| Contract Call Tx | [View on StellarExpert](https://stellar.expert/explorer/testnet/tx/416fb36f7cf87101400adc34ba5b4f49547bb71854aacf200502981a2fc4144f) |

#### Screenshots
| Step | Screenshot |
|------|------------|
| Home page (wallet connected) | ![Home](apps/level-2/screenshots/home.png) |
| Multi-wallet selection modal | ![Wallets](apps/level-2/screenshots/multipleWallets.png) |
| Freighter transaction approval | ![Freighter Tx](apps/level-2/screenshots/freighterTransaction.png) |
| Freighter transaction details | ![Details](apps/level-2/screenshots/freighterTransactionDetails.png) |
| Successful transaction | ![Success](apps/level-2/screenshots/transactionSuccesfull.png) |
| Transaction on StellarExpert | ![StellarExpert](apps/level-2/screenshots/stellarExpertTrasactionInformation.png) |
| USDC balance after conversion | ![USDC](apps/level-2/screenshots/usdcAfterConversion.png) |
| Cancelled transaction (user rejected) | ![Cancelled](apps/level-2/screenshots/cancelledTransaction.png) |

#### Setup
```sh
cd apps/level-2
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

#### Tech Stack
| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Wallet | @creit.tech/stellar-wallets-kit |
| SDK | @stellar/stellar-sdk (Horizon + RPC) |
| Animations | motion/react |
| Icons | @phosphor-icons/react |
| Smart Contract | Rust + soroban-sdk |
| Package manager | pnpm 9 |
| Dev port | 3000 |

---

### Level 3: stXLM Liquid Staking Vault (Orange Belt)

A liquid staking protocol on Stellar Testnet. Stake XLM and receive stXLM, a yield-bearing receipt token. Inspired by the ERC-4626 tokenized vault standard, built with two Soroban smart contracts communicating via cross-contract calls.

[Demo Video](https://www.youtube.com/watch?v=sQwNQjlO2u0) | [Live Demo](https://journey-to-mastery-level-3.vercel.app)

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **motion/react**, **@stellar/stellar-sdk**, and **soroban-sdk**.

#### Features
- Two Soroban smart contracts: stXLM token (SEP-41) + Vault (ERC-4626-inspired)
- Cross-contract communication (Vault mints/burns stXLM tokens)
- Multi-wallet support (Freighter, LOBSTR, xBull, Albedo, Rabet, Hana)
- Stake XLM and receive stXLM with live preview
- Unstake stXLM and withdraw XLM + accrued yield
- Event-driven refresh via Soroban getEvents() polling
- Live exchange rate with trend indicators
- Analytics dashboard with 6 chart types
- CI/CD pipeline (GitHub Actions: format, clippy, test, build, deploy)
- Yield adapter interface for production strategies
- Fee model, pause/unpause, treasury management
- 10+ passing contract tests
- 5 frontend pages: Dashboard, Stake, Unstake, Analytics, Transactions

#### Deployed Contracts (Testnet)
| Contract | Address | Explorer |
|----------|---------|----------|
| stXLM Token | `CDRE2N4LUYSRG77MB3K47XGI2MIV5OHX6CGXEYUEOKG3ALK25I2RZT2S` | [View](https://stellar.expert/explorer/testnet/contract/CDRE2N4LUYSRG77MB3K47XGI2MIV5OHX6CGXEYUEOKG3ALK25I2RZT2S) |
| Vault | `CAAVEIWGXQDBORNWDSNYMEB42L4A6Z6P3WC4QA3PLJ3U5IUXLYFQWQM5` | [View](https://stellar.expert/explorer/testnet/contract/CAAVEIWGXQDBORNWDSNYMEB42L4A6Z6P3WC4QA3PLJ3U5IUXLYFQWQM5) |

#### On-Chain Transactions
| Type | Hash | Explorer |
|------|------|----------|
| Deposit (10 XLM to 10 stXLM) | `e1f6b1b21235a241de22c4c68017c2478eccddd0e6a090d21ee63b39d743722b` | [View](https://stellar.expert/explorer/testnet/tx/e1f6b1b21235a241de22c4c68017c2478eccddd0e6a090d21ee63b39d743722b) |
| Withdraw (5 stXLM to 5 XLM) | `491e88ed620c8613c2caf256b45fc4f6b307e48e60253824c197f9916aaeb9b0` | [View](https://stellar.expert/explorer/testnet/tx/491e88ed620c8613c2caf256b45fc4f6b307e48e60253824c197f9916aaeb9b0) |

#### Screenshots
| View | Screenshot |
|------|------------|
| Stake form | ![Stake](apps/level-3/screenshots/stakeXLM.png) |
| Stake details | ![Stake Details](apps/level-3/screenshots/stakeXLM(details).png) |
| Unstake form | ![Unstake](apps/level-3/screenshots/unStakeXLM.png) |
| Unstake details | ![Unstake Details](apps/level-3/screenshots/unStakeXLM(transactiondetails).png) |
| Deposit on StellarExpert | ![Deposit](apps/level-3/screenshots/transactionsuccesfullStellarExpert(depsoit).png) |
| Withdraw on StellarExpert | ![Withdraw](apps/level-3/screenshots/transactionSuccesfullStellarExpert(unstake).png) |

#### Setup
```sh
cd apps/level-3
npm install
cp .env.example .env.local
npm run dev
```
Open [http://localhost:3002](http://localhost:3002).

#### Tech Stack
| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript strict, Rust (soroban-sdk v25) |
| Styling | Tailwind CSS v4 |
| Wallet | @creit.tech/stellar-wallets-kit |
| SDK | @stellar/stellar-sdk v16 |
| Animations | motion/react |
| Icons | @phosphor-icons/react |
| Smart Contracts | 2 Soroban contracts (stXLM + Vault) |
| Contract Target | wasm32v1-none |
| Package manager | npm (apps/level-3), pnpm 9 (monorepo root) |
| Dev port | 3002 |

---

## Future Levels

| Level | Topic | Status |
|-------|-------|--------|
| 1 | Simple Payment dApp (White Belt) | Complete |
| 2 | Token Swap Interface (Yellow Belt) | Complete |
| 3 | stXLM Liquid Staking Vault (Orange Belt) | Complete |

## Commands Reference

### Root (pnpm workspace)

```sh
pnpm dev --filter=docs          # Level 1 dev server (port 3001)
pnpm build --filter=docs        # Build Level 1
pnpm lint --filter=docs         # Lint Level 1
pnpm check-types --filter=docs  # TypeScript check Level 1

pnpm dev --filter=web           # Level 2 dev server (port 3000)
pnpm build --filter=web         # Build Level 2
pnpm lint --filter=web          # Lint Level 2
pnpm check-types --filter=web   # TypeScript check Level 2
```

### Level 3 (standalone npm)

```sh
cd apps/level-3
npm run dev                     # Dev server (port 3002)
npm run build                   # Production build
npm run lint                    # ESLint
npm run check-types             # TypeScript check
```
