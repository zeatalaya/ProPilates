# ProPilates

Blockchain-native Pilates platform on XION (Cosmos) with account abstraction, NFT marketplace, and credential verification.

## Tech Stack

- **Monorepo**: Yarn workspaces (`apps/web`, `apps/mobile`, `packages/shared`)
- **Web**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Mobile**: Expo 52, React Native, NativeWind
- **State**: Zustand 5 (persisted to localStorage)
- **DB**: Supabase (PostgreSQL + auth + storage)
- **Blockchain**: XION testnet-2 (CosmWasm smart contracts)
- **Auth**: Abstraxion OAuth3 (PKCE) for XION wallet, Spotify OAuth for music
- **Payments**: Crossmint (credit card to USDC)
- **Verification**: Reclaim Protocol (ZK proofs for certifications)

## Commands

```bash
yarn web          # Dev server (Next.js on localhost:3000)
yarn web:build    # Production build
yarn mobile       # Expo start
yarn mobile:ios   # iOS simulator
```

## Project Structure

```
apps/web/src/
  app/            # Next.js App Router pages
  components/     # React components (ui/, onboarding/, builder/, verify/, gallery/, marketplace/, profile/)
  contracts/      # CosmWasm message builders (treasury, marketplace, reclaim, clearance)
  lib/            # Utilities (oauth3, spotify, supabase, xion-transactions)
  stores/         # Zustand stores (auth, classBuilder, spotify, teachingMode, verify)
  hooks/          # Custom hooks (useOAuth3, useSpotifyPlayer)
  types/          # TypeScript types
  data/           # Static data (exercises, countries)

packages/shared/  # Shared types, stores, contracts, utils (imported by web + mobile)
```

## Smart Contracts (XION Testnet)

| Contract    | Purpose                                    |
|-------------|--------------------------------------------|
| Treasury    | Fee grants + auth grants for gasless UX    |
| Marketplace | CW721 NFT class portfolio trading          |
| Reclaim     | ZK proof storage for certifications        |
| Clearance   | CW721 certification badge minting          |

- Token: USDC via `ibc/usdc` (6 decimals)
- RPC: `https://rpc.xion-testnet-2.burnt.com:443`
- REST: `https://api.xion-testnet-2.burnt.com`

## Key Patterns

- **Gasless UX**: Treasury contract grants fee + auth permissions so users never handle gas
- **Dual OAuth**: Abstraxion (wallet) + Spotify (music) both use PKCE
- **Zustand stores**: Simple immutable stores with localStorage persistence
- **Contract message builders**: Each contract has a dedicated file in `contracts/` for building CosmWasm messages
- **Demo mode**: Falls back to mock XION address when OAuth3 not configured

## Database Tables (Supabase)

`instructors`, `exercises` (150+), `classes`, `class_blocks`, `block_exercises`, `playlists`, `spotify_tracks`, `verifications`, `subscriptions`, `portfolio_access`

## API Routes

- `POST /api/reclaim/verify` - Validate Reclaim ZK proofs server-side
- `GET /api/auth/oauth3/callback` - Abstraxion OAuth callback
- `GET /api/auth/spotify` - Spotify auth initiation
- `GET /api/spotify/callback` - Spotify OAuth callback
- `POST /api/spotify/refresh` - Refresh Spotify token

## Tier System

- **Free**: Build classes, exercise library, teaching mode (no save/marketplace)
- **Premium** (4.99 USDC/mo): Save classes, marketplace, Spotify, verification badges

## Coding Conventions

- Prefer editing existing files over creating new ones
- Use Zustand for state (not Context/Redux)
- Tailwind for all styling
- CosmWasm messages go in `contracts/` directory
- Types defined in `types/index.ts`
- Keep components feature-organized under `components/[feature]/`
