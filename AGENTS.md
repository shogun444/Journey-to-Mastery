# AGENTS.md — Stellar Journey: Level 1

## Project Overview
Simple Payment dApp on Stellar Testnet. Connect Freighter wallet → view XLM balance → send XLM to any address.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript strict
- **Styling:** Tailwind CSS v4 (CSS-based config via `@import "tailwindcss"`, NO `tailwind.config.ts`)
- **PostCSS:** `@tailwindcss/postcss` plugin (NOT `tailwindcss` plugin)
- **Wallet:** `@stellar/freighter-api`
- **SDK:** `@stellar/stellar-sdk` (Horizon for classic txs)
- **Icons:** `@phosphor-icons/react`
- **Animation:** CSS transitions only (no Framer Motion / GSAP)
- **Monorepo:** pnpm workspaces + Turborepo
- **Package Manager:** pnpm 9
- **Port:** 3001 (dev)

## Architecture Rules
1. **Every UI element is a component.** No raw `<button>`, `<input>`, `<h1>` in page files — always use `components/ui/*` primitives.
2. **`"use client"` only on leaf interactive components.** Server components everywhere else.
3. **Tailwind utility classes only.** No CSS modules, no inline styles, no `<style>` tags.
4. **`cn()` utility** for class merging (from `clsx` + `tailwind-merge`) in `lib/utils.ts`.
5. **All base UI in `components/ui/`** — button, input, card, badge, heading, subheading.
6. **Feature components in `components/<feature>/`** — wallet, payment, layout.
7. **Hooks in `hooks/`** — `useFreighter`, `useBalance`, `useTransaction`.
8. **Lib in `lib/`** — `stellar.ts` (config), `transactions.ts` (build/submit), `utils.ts` (cn helper).
9. **Types in `types/index.ts`** — shared interfaces.
10. **Icons from `@phosphor-icons/react`** — import individual icons, not the whole library.

## Component Patterns (shadcn-style)
- Each component accepts `className?: string` for extension
- Use `forwardRef` for form elements
- Variants via props (not separate components)
- Named export for primitives, default export for page components

## Stellar Conventions
- Horizon for classic ops (balance, payment via `StellarSdk.Operation.payment`)
- Network: testnet (`NEXT_PUBLIC_STELLAR_NETWORK=testnet`)
- Freighter only (no multi-wallet kit)
- Friendbot URL: `https://friendbot.stellar.org`
- SDK instance: `new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org")`
- Network passphrase: `StellarSdk.Networks.TESTNET`

## Error Handling Checklist
- Freighter not installed → show install link
- User rejects connection → clear message, allow retry
- Invalid address (regex `/^G[A-Z2-7]{55}$/`) → form validation on blur
- Insufficient balance → disable send, show "Insufficient funds"
- Network mismatch → warning badge in header
- Tx timeout → "check on StellarExpert"
- Account not funded → show friendbot button
- Server components never throw; client components catch all

## Dark Mode
- Default: dark (`class="dark"` on `<html>`)
- Light mode toggle optional (CSS class-based via parent wrapper)
- Tailwind `dark:` variant for all components

## Skills (for AI Agents)
The `skills/` directory contains SKILL.md files installed from Stellar and design skill repositories. Available skills:

**Stellar Skills** (from `stellar/stellar-dev-skill`):
- **`dapp`** — Wallet + transaction patterns (Freighter, sign, submit)
- **`data`** — Horizon & RPC API queries
- **`smart-contracts`** — Soroban contract patterns
- **`assets`** — Token issuance & trustlines
- **`agentic-payments`** — x402 paywalls
- **`standards`** — SEPs, CAPs reference
- **`zk-proofs`** — Groth16 on-chain verification

**Design Skills** (from `Leonxlnx/taste-skill`):
- **`design-taste-frontend`** — taste-skill v2 (anti-slop UI, dial-driven)
- **`industrial-brutalist-ui`** — Swiss type, terminal aesthetics
- **`minimalist-ui`** — Clean/linear minimal design
- **`gpt-taste`** — GPT-oriented stricter rules
- **`high-end-visual-design`** — Premium/editorial patterns
- **`imagegen-frontend-web`** — Web image generation prompts
- **`imagegen-frontend-mobile`** — Mobile image generation prompts
- **`brandkit`** — Brand identity boards
- **`image-to-code`** — Image → code workflows
- **`redesign-existing-projects`** — Redesign audit protocol
- **`stitch-design-taste`** — Component stitching patterns
- **`full-output-enforcement`** — Output length enforcement

Load the relevant skill before writing code. See `skills/README.md`.

## Design Reference
See `design.md` for full design system — color tokens, typography scale, spacing, component variants, and motion guidelines.

## PR Checklist
- [ ] `pnpm lint` passes (run from root: `pnpm lint --filter=docs`)
- [ ] `pnpm check-types` passes (run from root: `pnpm check-types --filter=docs`)
- [ ] `pnpm build` passes (run from root: `pnpm build --filter=docs`)
- [ ] Tested with Freighter on testnet
- [ ] Dark mode tested
- [ ] Loading/error/empty states handled for every component
- [ ] No CSS modules or inline styles
- [ ] Every UI element is a component from `components/ui/`
- [ ] `className` prop exposed on every component
