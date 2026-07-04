# Design System — Level 1: Stellar Payment dApp

## Design Direction
**"Stellar Terminal"** — fusion of taste-skill v2 (functional SaaS) + brutalist-skill (Tactical Telemetry).
- Dark mode by default (space/terminal aesthetic)
- Clean, utilitarian layout
- Monospace for data (balances, addresses, hashes)
- Sans-serif for UI labels
- Red accent for errors/alerts
- Blue accent for primary actions

## Dial Settings (taste-skill v2)
- `DESIGN_VARIANCE: 4` — functional grid, minimal asymmetry
- `MOTION_INTENSITY: 3` — CSS transitions only, no scroll hijacks
- `VISUAL_DENSITY: 5` — moderate spacing, comfortable reading

## Color Palette

### Dark Mode (default)
| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| Surface | `bg-zinc-950` | `#09090b` | Page background |
| Surface Elevated | `bg-zinc-900` | `#18181b` | Cards, inputs |
| Surface Hover | `bg-zinc-800` | `#27272a` | Hover states |
| Border | `border-zinc-800` | `#27272a` | Dividers, card outlines |
| Border Subtle | `border-zinc-800/50` | — | Light separators |
| Text Primary | `text-zinc-100` | `#f4f4f5` | Headings, body |
| Text Secondary | `text-zinc-400` | `#a1a1aa` | Labels, placeholders |
| Text Muted | `text-zinc-500` | `#71717a` | Caption, helper |
| Accent (Action) | `text-blue-500` / `bg-blue-500` | `#3b82f6` | Primary CTAs, links |
| Accent Hover | `bg-blue-600` | `#2563eb` | CTA hover |
| Danger | `text-red-500` / `bg-red-500` | `#ef4444` | Errors, failures |
| Danger Hover | `bg-red-600` | `#dc2626` | Error hover |
| Success | `text-emerald-500` / `bg-emerald-500` | `#10b981` | Tx success |
| Warning | `text-amber-500` / `bg-amber-500` | `#f59e0b` | Pending/warning |

### Light Mode
| Token | Tailwind | Hex |
|---|---|---|
| Surface | `bg-zinc-50` | `#fafafa` |
| Surface Elevated | `bg-white` | `#ffffff` |
| Text Primary | `text-zinc-900` | `#18181b` |
| Text Secondary | `text-zinc-500` | `#71717a` |
| Border | `border-zinc-200` | `#e4e4e7` |

## Typography

### Font Stack
| Usage | Font | Source |
|---|---|---|
| Display/Headings | Geist (sans) | `next/font/local` |
| Body/Labels | Geist (sans) | same |
| Data/Mono | Geist Mono (mono) | `next/font/local` |

### Type Scale
| Level | Size | Weight | Tracking | Line Height | Usage |
|---|---|---|---|---|---|
| H1 | `text-3xl md:text-4xl` | `font-bold` | `tracking-tight` | `leading-tight` | Page title |
| H2 | `text-xl md:text-2xl` | `font-semibold` | `tracking-tight` | `leading-snug` | Section titles |
| H3 | `text-lg` | `font-medium` | — | `leading-snug` | Card titles |
| Subheading | `text-sm` | `font-medium` | `tracking-wide uppercase` | `leading-normal` | Labels, eyebrow |
| Body | `text-sm` | `font-normal` | — | `leading-relaxed` | Paragraphs |
| Caption | `text-xs` | `font-normal` | — | `leading-normal` | Helper, secondary info |
| Mono Data | `text-sm font-mono` | `font-normal` | — | `leading-normal` | Addresses, balance, tx hash |
| Mono Tiny | `text-xs font-mono` | `font-normal` | — | `leading-normal` | Shortened hash |

## Component Library (`components/ui/`)

### Heading
```tsx
<Heading as="h1">Send XLM</Heading>
```
Props: `as?: 'h1' | 'h2' | 'h3'` (default `h1`), `className?: string`, `children: React.ReactNode`
Styles map automatically: h1→H1 scale, h2→H2 scale, h3→H3 scale.

### Subheading
```tsx
<Subheading>Connected Network: Testnet</Subheading>
```
Props: `className?: string`, `children: React.ReactNode`
Styles: `text-sm font-medium tracking-wide uppercase text-zinc-400`

### Button
```tsx
<Button variant="primary" onClick={handleClick}>Connect Wallet</Button>
<Button variant="primary" loading>Processing...</Button>
<Button variant="danger" disabled>Send</Button>
```
Variants:
| Variant | Normal | Hover | Disabled |
|---|---|---|---|
| `primary` | `bg-blue-500 text-white` | `bg-blue-600` | `opacity-50 cursor-not-allowed` |
| `secondary` | `bg-zinc-800 text-zinc-100` | `bg-zinc-700` | `opacity-50 cursor-not-allowed` |
| `ghost` | `bg-transparent text-zinc-400` | `bg-zinc-800 text-zinc-100` | `opacity-50 cursor-not-allowed` |
| `danger` | `bg-red-500 text-white` | `bg-red-600` | `opacity-50 cursor-not-allowed` |

Sizes: `sm` (h-8 px-3 text-xs), `md` (h-9 px-4 text-sm, default), `lg` (h-10 px-5 text-sm)
Props: `variant`, `size`, `loading`, `disabled`, `className`, `children`, `onClick`, `type`

### Input
```tsx
<Input label="Amount" placeholder="0.0" error="Required" />
```
Props: `label?: string`, `error?: string`, `className?: string`, plus native `<input>` attrs
Layout: label above (`text-sm text-zinc-400`), input (`bg-zinc-900 border-zinc-800`), error below (`text-xs text-red-500`)

### Card
```tsx
<Card title="Balance">
  <p>Content here</p>
</Card>
```
Props: `title?: string`, `className?: string`, `children: React.ReactNode`
Styles: `bg-zinc-900 border border-zinc-800 rounded-xl`
Title rendered as `<Subheading>` when provided.

### Badge
```tsx
<Badge variant="success">Transaction Confirmed</Badge>
```
Props: `variant: 'default' | 'success' | 'error' | 'warning'`, `className?: string`, `children: React.ReactNode`
| Variant | Style |
|---|---|
| `default` | `bg-zinc-800 text-zinc-300` |
| `success` | `bg-emerald-500/10 text-emerald-500` |
| `error` | `bg-red-500/10 text-red-500` |
| `warning` | `bg-amber-500/10 text-amber-500` |

## Spacing Scale
| Token | Value | Usage |
|---|---|---|
| Section gap | `gap-8` | Between major sections |
| Card padding | `p-6` | Inside cards |
| Stack gap | `gap-4` | Between form fields |
| Inline gap | `gap-2` | Between inline elements |
| Page padding | `px-4 md:px-8 py-8` | Page edges |
| Header height | `h-16` | Sticky top nav |

## Layout
- Container: `max-w-lg mx-auto` (narrow, focused on payment flow)
- Card-centered layout
- Header: sticky top with wallet info
- Footer: minimal, just copyright

## Motion (MOTION=3)
- Button hover: `transition-colors duration-150`
- Loading: `animate-pulse` skeleton
- Success/error: fade in (`transition-opacity duration-200`)
- Disabled state: `opacity-50`
- No GSAP, no Framer Motion, no scroll animations
- `prefers-reduced-motion` respected via Tailwind: no custom animations

## Border Radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)
- Badges: `rounded-full` (pill)
- Sharp corners never used

## Shadows
- Cards: `shadow-sm` (subtle)
- No glowing/hover shadows
- No pure black shadows — tinted to surface color
