import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  calculateNormalizedScore,
  tierFromBaseline,
  type Tier,
} from "@/utils/deltaEngine";

export interface User {
  id: string;
  handle: string;
  tier: Tier;
  baselineSeconds: number;
  currentSeconds: number;
  balance: number;
}

export interface Pool {
  id: string;
  title: string;
  pot: number;
  entryFee: number;
  participants: string[];
  /** handle -> tier weighted sweat score, snapshotted on every mine */
  scores: Record<string, number>;
}

export interface MarketState {
  users: User[];
  activeUserId: string;
  pools: Pool[];
  setActiveUser: (id: string) => void;
  mineSweat: (paceLoggedSeconds: number) => { minted: number; score: number };
  stakePool: (poolId: string) => { ok: boolean; reason?: string };
}

export const SEED_USERS: User[] = [
  {
    id: "user-1",
    handle: "@couch_to_5k",
    tier: "Beginner",
    baselineSeconds: 900,
    currentSeconds: 900,
    balance: 250,
  },
  {
    id: "user-2",
    handle: "@boston_sub3",
    tier: "Elite",
    baselineSeconds: 350,
    currentSeconds: 350,
    balance: 800,
  },
  {
    id: "user-3",
    handle: "@trail_blazer",
    tier: "Intermediate",
    baselineSeconds: 600,
    currentSeconds: 600,
    balance: 420,
  },
];

export const SEED_POOLS: Pool[] = [
  {
    id: "pool-1",
    title: "Sunday 10K Sprint Handicap",
    pot: 1200,
    entryFee: 50,
    participants: ["@boston_sub3", "@trail_blazer"],
    scores: { "@boston_sub3": 0, "@trail_blazer": 0 },
  },
  {
    id: "pool-2",
    title: "Zero To Hero Weekly Delta",
    pot: 640,
    entryFee: 25,
    participants: ["@couch_to_5k"],
    scores: { "@couch_to_5k": 0 },
  },
];

export type MarketStore = ReturnType<typeof createMarketStore>;

export const createMarketStore = () =>
  createStore<MarketState>()(
    persist(
      (set, get) => ({
        users: SEED_USERS,
        activeUserId: SEED_USERS[0].id,
        pools: SEED_POOLS,

        setActiveUser: (id) => set({ activeUserId: id }),

        mineSweat: (paceLoggedSeconds) => {
          const { users, activeUserId, pools } = get();
          const active = users.find((u) => u.id === activeUserId);
          if (!active) return { minted: 0, score: 0 };

          const minted = Math.floor(Math.random() * 26) + 15; // +15 to +40
          const { finalScore } = calculateNormalizedScore(
            active.baselineSeconds,
            paceLoggedSeconds
          );

          set({
            users: users.map((u) =>
              u.id === activeUserId
                ? {
                    ...u,
                    currentSeconds: paceLoggedSeconds,
                    tier: tierFromBaseline(u.baselineSeconds),
                    balance: u.balance + minted,
                  }
                : u
            ),
            pools: pools.map((p) =>
              p.participants.includes(active.handle)
                ? { ...p, scores: { ...p.scores, [active.handle]: finalScore } }
                : p
            ),
          });

          return { minted, score: finalScore };
        },

        stakePool: (poolId) => {
          const { users, activeUserId, pools } = get();
          const active = users.find((u) => u.id === activeUserId);
          const pool = pools.find((p) => p.id === poolId);
          if (!active || !pool) return { ok: false, reason: "NOT_FOUND" };
          if (pool.participants.includes(active.handle))
            return { ok: false, reason: "ALREADY_STAKED" };
          if (active.balance < pool.entryFee)
            return { ok: false, reason: "INSUFFICIENT_SWEAT" };

          const { finalScore } = calculateNormalizedScore(
            active.baselineSeconds,
            active.currentSeconds
          );

          set({
            users: users.map((u) =>
              u.id === activeUserId
                ? { ...u, balance: u.balance - pool.entryFee }
                : u
            ),
            pools: pools.map((p) =>
              p.id === poolId
                ? {
                    ...p,
                    pot: p.pot + p.entryFee,
                    participants: [...p.participants, active.handle],
                    scores: { ...p.scores, [active.handle]: finalScore },
                  }
                : p
            ),
          });

          return { ok: true };
        },
      }),
      {
        name: "deltabet-market-v1",
        storage: createJSONStorage(() => localStorage),
        // The provider rehydrates inside an effect so SSR markup always
        // matches the first client render.
        skipHydration: true,
      }
    )
  );
