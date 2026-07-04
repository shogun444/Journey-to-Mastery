# Stellar Journey — Level 1: Simple Payment dApp

A minimal Stellar payment dApp on the Stellar testnet. Connect your Freighter wallet, view XLM balance, and send XLM to any Stellar address.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **@stellar/stellar-sdk**.

## Features

- Freighter wallet connect / disconnect
- XLM balance display with auto-refresh
- Send XLM to any Stellar address (G...)
- Testnet Friendbot funding (10,000 free XLM)
- Transaction status tracking (build → sign → submit → confirm)
- View transaction on [StellarExpert](https://stellar.expert/explorer/testnet)
- Dark / light mode toggle
- Form validation (address format, amount, insufficient balance)
- Error handling for all states (Freighter not found, connection rejected, network errors, tx failures)

## Prerequisites

- **Node.js** 20+
- **pnpm** 9
- **Freighter** browser extension ([install](https://www.freighter.app/))

## Setup

```sh
# Clone
git clone https://github.com/shogun444/Journey-to-Mastery.git
cd Journey-to-Mastery

# Install
pnpm install

# Start Level 1
pnpm dev --filter=docs
```

Open [http://localhost:3001](http://localhost:3001).

Env defaults to testnet — no changes needed. To override, create `apps/level-1/.env.local`:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

## Usage

1. Install [Freighter](https://www.freighter.app/) and switch to **Testnet**
2. Click **Connect Wallet** in the header
3. (Optional) Click **Get Testnet XLM (Friendbot)** to fund your account
4. Enter a destination G... address and amount
5. Click **Send** → sign in Freighter
6. View confirmation and click **View on StellarExpert**

## Screenshots

### 1. Testnet Transaction of 34 XLM
![Testnet Transaction of 34 XLM](screenshots/transactions(Testnet).png)

### 2. Transaction on StellarExpert
![Transaction on StellarExpert](screenshots/transactiononStellarExpert.png)

### 3. Successful Transaction
![Successful Transaction](screenshots/transactionConfirmed.png)

### 4. Transaction of 500 XLM with History
![Transaction of 500 XLM with History](screenshots/transactionHistoryWithBalanceAfterSucessfullTransactrion.png)

Example transaction:
[https://stellar.expert/explorer/testnet/tx/4e5ec6bacc5d4975118287c3b8cab47aa6f173fdc8745000454195e0b97d6576](https://stellar.expert/explorer/testnet/tx/4e5ec6bacc5d4975118287c3b8cab47aa6f173fdc8745000454195e0b97d6576)

## Project Structure

```
apps/level-1/
├── app/
│   ├── globals.css          # Tailwind v4 + CSS variables
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page (AIDA structure)
│   └── providers.tsx        # Theme provider
├── components/
│   ├── layout/              # Header, HeroSection, Footer
│   ├── payment/             # SendPaymentForm, TransactionLink
│   ├── ui/                  # Alert, Badge, Button, Card, Heading, Input, Spinner, Text, ThemeToggle
│   └── wallet/              # BalanceDisplay, ConnectButton, WalletInfo
├── hooks/                   # useBalance, useFreighter, useTheme, useTransaction
├── lib/                     # stellar.ts, transactions.ts, utils.ts
├── types/                   # index.ts
└── screenshots/             # Submission screenshots
```

## Submission Checklist

- [x] Public GitHub repository: https://github.com/shogun444/Journey-to-Mastery
- [x] README with project description + setup instructions
- [x] Screenshots included (wallet connected, balance, tx confirmed, StellarExpert)
- [x] Transaction result shown to user
- [ ] GitHub repository link submitted before deadline

## Tech Stack

| Category | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Wallet | @stellar/freighter-api |
| SDK | @stellar/stellar-sdk (Horizon) |
| Icons | @phosphor-icons/react |
| Animations | CSS transitions only |
| Package manager | pnpm 9 |
| Dev port | 3001 |
