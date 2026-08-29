"use client";

import { Trophy } from "lucide-react";
import { useActiveUser, useMarketStore } from "@/store/MarketStoreProvider";
import { calculateNormalizedScore, multiplierFromBaseline } from "@/utils/deltaEngine";

export function Leaderboard({ poolId }: { poolId: string }) {
  const pool = useMarketStore((s) => s.pools.find((p) => p.id === poolId));
  const users = useMarketStore((s) => s.users);
  const active = useActiveUser();

  if (!pool) return null;

  const rows = pool.participants
    .map((handle) => {
      const user = users.find((u) => u.handle === handle);
      const score = user
        ? calculateNormalizedScore(user.baselineSeconds, user.currentSeconds)
            .finalScore
        : (pool.scores[handle] ?? 0);
      const multiplier = user ? multiplierFromBaseline(user.baselineSeconds) : 1;
      return { handle, score, multiplier, isActive: handle === active.handle };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/60">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-zinc-300 uppercase">
          <Trophy size={13} className="text-[#00FF66]" /> Leaderboard
        </h2>
        <span className="text-[9px] tracking-widest text-zinc-500">
          POT {pool.pot} $SWEAT
        </span>
      </div>

      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-[9px] tracking-widest text-zinc-500 uppercase">
            <th className="px-3 py-2 font-normal">Rank</th>
            <th className="px-2 py-2 font-normal">Athlete</th>
            <th className="px-2 py-2 text-right font-normal">Tier</th>
            <th className="px-3 py-2 text-right font-normal">Sweat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.handle}
              className={
                row.isActive
                  ? "border-y border-[#00FF66]/40 bg-[#00FF66]/5 shadow-[inset_0_0_18px_rgba(0,255,102,0.07)]"
                  : "border-t border-zinc-900"
              }
            >
              <td className="px-3 py-2.5 text-zinc-500">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-2 py-2.5 font-bold">
                {row.handle}
                {row.isActive ? (
                  <span className="ml-1.5 text-[8px] tracking-widest text-[#00FF66]">
                    YOU
                  </span>
                ) : null}
              </td>
              <td className="px-2 py-2.5 text-right text-zinc-400">
                x{row.multiplier.toFixed(1)}
              </td>
              <td
                className="px-3 py-2.5 text-right font-bold"
                style={{ color: row.score >= 0 ? "#00FF66" : "#FF3344" }}
              >
                {row.score > 0 ? "+" : ""}
                {row.score.toFixed(2)}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-zinc-600">
                NO ATHLETES STAKED YET
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
