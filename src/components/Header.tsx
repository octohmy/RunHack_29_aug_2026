"use client";

import { ChevronDown, Flame, Wallet } from "lucide-react";
import { useActiveUser, useMarketStore } from "@/store/MarketStoreProvider";
import { formatPace, multiplierFromBaseline } from "@/utils/deltaEngine";

export function Header() {
  const users = useMarketStore((s) => s.users);
  const activeUserId = useMarketStore((s) => s.activeUserId);
  const setActiveUser = useMarketStore((s) => s.setActiveUser);
  const active = useActiveUser();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#090A0C]/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-[#00FF66]" />
          <span className="text-sm font-bold tracking-[0.2em]">DELTA//BET</span>
          <span className="ml-1 flex items-center gap-1 rounded-full border border-[#00FF66]/40 bg-[#00FF66]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#00FF66]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF66] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00FF66]" />
            </span>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1">
          <Wallet size={12} className="text-zinc-500" />
          <span className="text-[11px] font-bold text-[#00FF66]">
            {active.balance}
          </span>
          <span className="text-[9px] tracking-widest text-zinc-500">$SWEAT</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-900 px-4 py-2">
        <div className="relative flex items-center">
          <select
            aria-label="Switch demo persona"
            value={activeUserId}
            onChange={(e) => setActiveUser(e.target.value)}
            className="appearance-none rounded-md border border-zinc-800 bg-zinc-900 py-1 pr-7 pl-2 text-[11px] font-bold text-white outline-none focus:border-[#00FF66]/50"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.handle}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2 text-zinc-500"
          />
        </div>
        <div className="text-right text-[9px] leading-tight tracking-widest text-zinc-500 uppercase">
          <div>
            {active.tier} · x
            {multiplierFromBaseline(active.baselineSeconds).toFixed(1)}
          </div>
          <div className="text-zinc-600">
            BASE {formatPace(active.baselineSeconds)}/MI · NOW{" "}
            {formatPace(active.currentSeconds)}
          </div>
        </div>
      </div>
    </header>
  );
}
