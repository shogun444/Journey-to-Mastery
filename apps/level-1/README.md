# Stellar Journey — Level 1: Simple Payment dApp

A minimal Stellar payment dApp built on the Stellar testnet. Connect your Freighter wallet, view your XLM balance, and send XLM to any Stellar address.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **@stellar/stellar-sdk**.

## Features

- Freighter wallet connect / disconnect
- XLM balance display (auto-refresh after send)
- Send XLM to any Stellar address (G...)
- Testnet Friendbot funding (get 10,000 free XLM)
- Transaction status tracking (build → sign → submit → confirm)
- View transaction on [StellarExpert](https://stellar.expert/explorer/testnet)
- Dark / light mode toggle
- Form validation (address format, amount, insufficient balance)
- Error handling for all states (Freighter not installed, connection rejected, network errors, tx failures)

## Prerequisites

- **Node.js** 20+
- **pnpm** 9
- **Freighter** browser extension ([install](https://www.freighter.app/))

## Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/stellar-journey.git
cd stellar-journey

# Install dependencies
pnpm install

# Set environment (defaults to testnet — no changes needed)
# Optional: create apps/level-1/.env.local
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Start the dev server (port 3001)
pnpm dev --filter=docs
```

Open [http://localhost:3001](http://localhost:3001).

## Usage

1. Install the [Freighter](https://www.freighter.app/) browser extension
2. Create or import a wallet and switch to **Testnet**
3. Click **Connect Wallet** in the header
4. (Optional) Click **Get Testnet XLM (Friendbot)** to fund your account
5. Enter a destination address (G...) and amount
6. Click **Send** → sign in Freighter
7. View the success message and click **View on StellarExpert**

## Screenshots

> Replace these with your own screenshots before submitting.

| State | Screenshot |
|---|---|
| Wallet connected + balance | `./screenshots/wallet-connected.png` |
| Successful transaction | `./screenshots/transaction-success.png` |
| Transaction on StellarExpert | `./screenshots/stellar-expert.png` |

Example transaction on testnet:
[https://stellar.expert/explorer/testnet/tx/4e5ec6bacc5d4975118287c3b8cab47aa6f173fdc8745000454195e0b97d6576](https://stellar.expert/explorer/testnet/tx/4e5ec6bacc5d4975118287c3b8cab47aa6f173fdc8745000454195e0b97d6576)

## Project Structure

```
apps/level-1/
├── app/
│   ├── globals.css          # Tailwind v4 setup + semantic tokens
│   ├── layout.tsx           # Root layout (fonts, header, footer)
│   ├── page.tsx             # Landing page (AIDA structure)
│   └── providers.tsx        # Theme provider
├── components/
│   ├── layout/
│   │   ├── header.tsx       # Sticky nav + wallet + theme toggle
│   │   ├── hero-section.tsx # Gradient hero (Attention)
│   │   └── footer.tsx       # Footer (Action)
│   ├── payment/
│   │   ├── send-payment-form.tsx  # Send XLM flow
│   │   └── transaction-link.tsx   # StellarExpert link
│   ├── ui/
│   │   ├── alert.tsx        # Error / success / warning / info
│   │   ├── badge.tsx        # Status badges
│   │   ├── button.tsx       # Button (4 variants, loading state)
│   │   ├── card.tsx         # Elevated card surface
│   │   ├── heading.tsx      # H1 / H2 / H3
│   │   ├── input.tsx        # Labeled input with error
│   │   ├── spinner.tsx      # Loading spinner
│   │   ├── subheading.tsx   # Uppercase section label
│   │   ├── text.tsx         # Body / caption / mono / display
│   │   └── theme-toggle.tsx # Dark/light toggle
│   └── wallet/
│       ├── balance-display.tsx   # XLM balance (auto-refresh)
│       ├── connect-button.tsx    # Connect / disconnect
│       └── wallet-info.tsx       # Network badge + address
├── hooks/
│   ├── useBalance.ts        # Horizon balance fetch
│   ├── useFreighter.ts      # Freighter connect / sign
│   ├── useTheme.tsx         # Dark/light context
│   └── useTransaction.ts    # Tx state machine
├── lib/
│   ├── stellar.ts           # Horizon + network config
│   ├── transactions.ts      # Build XDR, submit, friendbot
│   └── utils.ts             # cn() helper
└── types/
    └── index.ts             # Shared interfaces
```

## Submission Checklist

- [ ] Public GitHub repository
- [ ] README.md with project description + setup instructions
- [ ] Screenshots included:
  - Wallet connected state
  - Balance displayed
  - Successful testnet transaction
  - Transaction result shown to user
- [ ] GitHub repository link submitted before deadline

## Stacks

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
