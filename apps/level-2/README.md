# Level 2 — Token Swap Interface (Blue Belt)

A premium token swap dApp on the Stellar testnet. Multi-wallet support via **@creit.tech/stellar-wallets-kit**, DEX swaps through the Stellar orderbook using classic path payments, and high-end UI with Ethereal Glass design language.

Built with **Next.js 16**, **TypeScript strict**, **Tailwind CSS v4**, **@stellar/stellar-sdk**, and **motion/react**.

## Features

- **Multi-wallet:** Connect Freighter, LOBSTR, xBull, Albedo, Rabet, or Hana
- **Token swap:** Select source/destination tokens, view live rates from DEX orderbook
- **Path payments:** Uses `PathPaymentStrictSend` for optimal routing via Horizon
- **Slippage protection:** Configurable tolerance (0.5%, 1%, 2.5%, 5% or custom)
- **Transaction tracking:** Polls until confirmed with StellarExpert link
- **Premium UI:** Ethereal Glass design — radial gradients, noise grain, double-bezel cards, floating island nav, ambient shadows, spring physics
- **Dark / light mode:** Full theme support with adaptive glass tokens
- **Error handling:** Wallet not found, insufficient balance, user rejection, network mismatch, slippage exceeded, tx failure

## Screenshots

### 1. Home Page (Wallet Connected)
![Home Page](screenshots/home.png)

### 2. Freighter Transaction Approval
![Freighter Transaction](screenshots/freighterTransaction.png)

### 3. Successful Transaction
![Transaction Successful](screenshots/transactionSuccesfull.png)

### 4. Transaction on StellarExpert
![StellarExpert Transaction](screenshots/stellarExpertTrasactionInformation.png)

### 5. USDC Balance After Conversion
![USDC After Conversion](screenshots/usdcAfterConversion.png)

Example transaction:
[https://stellar.expert/explorer/testnet/tx/5501bfa197fa0a644b34cc0c9f55885153faed1be24030dd55963914b3197eed](https://stellar.expert/explorer/testnet/tx/5501bfa197fa0a644b34cc0c9f55885153faed1be24030dd55963914b3197eed)

## Getting Started

```sh
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Smart Contract

The AMM contract at `contracts/amm/` wraps Stellar DEX path payments with event emission.

### Deployed Contract

- **Network:** Stellar Testnet
- **Contract ID:** (TBD — run `pnpm contract:deploy`)

### Functions

- `swap(swap)` — Execute a path payment swap
- `getSwapPreview(swap)` — Simulate swap and return estimated output
- `getSupportedPairs(swap)` — List available trading pairs

### Events

- `SwapExecuted` — Emitted on successful swap with sender, assets, amounts, ledger

## Project Structure

```
app/
├── layout.tsx         — Root layout with providers + noise grain overlay
├── page.tsx           — Swap page shell with premium spacing
├── providers.tsx      — Theme context provider
├── globals.css        — Tailwind v4 + Ethereal Glass design tokens
components/
├── ui/               — Button, input, card, badge, select, dialog, heading, subheading
├── wallet/           — ConnectButton, WalletModal, NetworkBadge, AccountDisplay
├── swap/             — SwapForm, TokenSelect, RateDisplay, SwapButton, TransactionStatus, OrderbookPanel
├── layout/           — Header (floating island)
├── theme/            — ThemeToggle
hooks/
├── useStellarWallet  — Multi-wallet connection (StellarWalletsKit v2.5.0)
├── useBalance        — Horizon balance polling
├── useOrderbook      — DEX orderbook queries
├── useSwap           — Build + sign + submit swap tx
├── useTransactionStatus — Pending/success/fail polling
lib/
├── stellar.ts        — Horizon + RPC config
├── transactions.ts   — Build/submit classic + Soroban transactions
├── dex.ts            — Orderbook + balance queries
├── tokens.ts         — Token list (XLM, USDC, Aqua, etc.)
├── utils.ts          — cn() classname helper
types/
├── index.ts          — SwapParams, Token, Order, etc.
contracts/amm/
├── Cargo.toml        — Rust contract config
├── src/lib.rs        — Swap contract with auth + events
```

## Design System

- **Vibe:** Ethereal Glass — deep OLED `#050505` background, radial mesh gradients, vantablack glass cards with `backdrop-blur-2xl`, pure white/10 hairlines
- **Layout:** Centered single-column with bento-inspired card sections
- **Card Architecture:** Double-bezel (Doppelrand) — outer shell with subtle bg + hairline ring, inner core with gradient + inset highlight
- **Shadows:** `--shadow-card` (elevated), `--shadow-ambient` (large modal), `--shadow-glow-blue` (focus rings)
- **Motion:** Custom cubic-bezier `(0.32, 0.72, 0, 1)`, spring physics on interactive elements, staggered entry fade-ups
- **Typography:** Geist Sans + Geist Mono via `next/font/local`
- **Icons:** Phosphor Icons (thin, precise strokes)

## Tech Stack

| Category | Choice |
|---|---|
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
