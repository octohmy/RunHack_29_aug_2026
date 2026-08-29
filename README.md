# DELTA//BET — RunHack, 29 Aug 2026

A zero-backend Web3-styled **fitness prediction market**: you bet on *relative
improvement* (Delta), not absolute speed. A beginner going 15:00 → 13:30/mi can
beat an elite marathoner shaving 5 seconds, because raw improvement is weighted
by a physiological ceiling multiplier.

## Run it

```bash
git clone https://github.com/octohmy/RunHack_29_aug_2026.git
cd RunHack_29_aug_2026
npm install
npm run dev      # http://localhost:3000
```

No env vars, no backend, no database. All state lives in `localStorage`.

## Demo script (2 laptops)

1. Header persona switcher — flip between `@couch_to_5k`, `@boston_sub3`,
   `@trail_blazer`. Every laptop can run a different athlete.
2. **Live Markets** tab → *Mine Sweat Equity*: drag the pace slider, hit
   `LOG RUN (+ MINT TOKENS)`. Randomised +15–40 $SWEAT is minted and the pool
   score updates.
3. Tap `ENTRY STAKE` on a pool → confirm in the stake dialog. Entry fee leaves
   the wallet, enters the pot, and you join the leaderboard.
4. **Pool Deep-Dive** tab → leaderboard ranked by tier-weighted Sweat Score.
   Your row is glow-highlighted; gains green, losses red.

State persists per browser, so reload mid-demo is safe. To reset a laptop:
clear the `deltabet-market-v1` key in localStorage (or use an incognito window).

## The handicap math

`src/utils/deltaEngine.ts` converts a raw % pace improvement into a
tier-weighted Sweat Score:

```
rawDelta   = (baseline - current) / baseline * 100
multiplier = baseline <= 390s ? 10.0   // Elite        (<= 6:30/mi)
           : baseline <= 540s ? 3.5    // Advanced     (6:31 – 9:00)
           : baseline <= 720s ? 1.8    // Intermediate (9:01 – 12:00)
           :                    1.0    // Beginner     (12:01+)
finalScore = rawDelta * multiplier
```

Multipliers rise as the baseline gets faster: an elite athlete has almost no
headroom left, so each percent they claw back is worth 10x a beginner's.

## Architecture

```
src/
  app/layout.tsx            terminal shell + providers (mono, max-w-md, dark)
  app/page.tsx              renders <Terminal/>
  utils/deltaEngine.ts      handicap math (pure, no deps)
  store/useMarketStore.ts   zustand vanilla store + persist(localStorage)
  store/MarketStoreProvider store instance in React context + hydration gate
  components/               Header (persona switcher, wallet), MiningPanel,
                            StakeDialog, Leaderboard, Terminal (tabs), Toasts
```

Hydration: the store is created per-provider with `skipHydration: true` and
rehydrated inside an effect, and the UI renders a placeholder until that
finishes — so server HTML and the first client paint always match (no Next 15
hydration mismatch, and no module-level singleton leaking between requests).

Stack: Next.js 15 (App Router, TS), Tailwind v4, zustand, Radix primitives
(Dialog / Tabs / Slider / Progress / Toast), lucide-react.

## Health disclaimer

Hackathon project, not a medical device. Nothing here is medical advice.
