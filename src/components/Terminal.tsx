"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { Activity, BarChart3, ChevronRight, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { MiningPanel } from "@/components/MiningPanel";
import { StakeDialog } from "@/components/StakeDialog";
import { Leaderboard } from "@/components/Leaderboard";
import { useActiveUser, useHydrated, useMarketStore } from "@/store/MarketStoreProvider";

export function Terminal() {
  const hydrated = useHydrated();
  const pools = useMarketStore((s) => s.pools);
  const [tab, setTab] = useState("markets");
  const [selectedPoolId, setSelectedPoolId] = useState(pools[0]?.id ?? "");
  const [stakePoolId, setStakePoolId] = useState<string | null>(null);
  const stakeTarget = pools.find((p) => p.id === stakePoolId) ?? null;

  const openDeepDive = (poolId: string) => {
    setSelectedPoolId(poolId);
    setTab("pool");
  };

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-[11px] tracking-widest text-zinc-600">
        LOADING MARKET STATE…
      </div>
    );
  }

  return (
    <>
      <Header />
      <Tabs.Root
        value={tab}
        onValueChange={setTab}
        className="flex flex-1 flex-col"
      >
        <Tabs.List className="grid grid-cols-2 border-b border-zinc-800">
          <TabTrigger value="markets" icon={<Activity size={12} />} label="LIVE MARKETS" />
          <TabTrigger value="pool" icon={<BarChart3 size={12} />} label="POOL DEEP-DIVE" />
        </Tabs.List>

        <Tabs.Content value="markets" className="flex-1 space-y-3 p-4 outline-none">
          {pools.map((pool) => (
            <PoolCard
              key={pool.id}
              poolId={pool.id}
              onStake={() => setStakePoolId(pool.id)}
              onDeepDive={() => openDeepDive(pool.id)}
            />
          ))}
          <MiningPanel />
        </Tabs.Content>

        <Tabs.Content value="pool" className="flex-1 space-y-3 p-4 outline-none">
          <div className="flex flex-wrap gap-2">
            {pools.map((pool) => (
              <button
                key={pool.id}
                onClick={() => setSelectedPoolId(pool.id)}
                className={`rounded-md border px-2.5 py-1 text-[10px] tracking-widest transition-colors ${
                  pool.id === selectedPoolId
                    ? "border-[#00FF66]/50 bg-[#00FF66]/10 text-[#00FF66]"
                    : "border-zinc-800 text-zinc-500 hover:text-white"
                }`}
              >
                {pool.id.toUpperCase()}
              </button>
            ))}
          </div>
          <PoolSummary poolId={selectedPoolId} onStake={() => setStakePoolId(selectedPoolId)} />
          <Leaderboard poolId={selectedPoolId} />
        </Tabs.Content>
      </Tabs.Root>

      {stakeTarget ? (
        <StakeDialog
          pool={stakeTarget}
          open={stakePoolId !== null}
          onOpenChange={(open) => setStakePoolId(open ? stakePoolId : null)}
        />
      ) : null}
    </>
  );
}

function TabTrigger({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className="flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold tracking-widest text-zinc-500 transition-colors outline-none data-[state=active]:border-b-2 data-[state=active]:border-[#00FF66] data-[state=active]:text-[#00FF66]"
    >
      {icon}
      {label}
    </Tabs.Trigger>
  );
}

function PoolCard({
  poolId,
  onStake,
  onDeepDive,
}: {
  poolId: string;
  onStake: () => void;
  onDeepDive: () => void;
}) {
  const pool = useMarketStore((s) => s.pools.find((p) => p.id === poolId))!;
  const active = useActiveUser();
  const staked = pool.participants.includes(active.handle);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs font-bold tracking-wide">{pool.title}</h3>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] tracking-widest ${
            staked
              ? "border-[#00FF66]/40 text-[#00FF66]"
              : "border-zinc-700 text-zinc-500"
          }`}
        >
          {staked ? "STAKED" : "OPEN"}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[8px] tracking-widest text-zinc-500">TOTAL POT</div>
          <div className="text-lg font-bold text-[#00FF66]">
            {pool.pot}
            <span className="ml-1 text-[9px] tracking-widest text-zinc-500">
              $SWEAT
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] tracking-widest text-zinc-500">
          <Users size={11} /> {pool.participants.length} · FEE {pool.entryFee}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onStake}
          className="flex-1 rounded-md border border-[#00FF66]/50 bg-[#00FF66]/10 py-2 text-[10px] font-bold tracking-widest text-[#00FF66] transition-all hover:bg-[#00FF66]/20 active:scale-[0.98]"
        >
          ENTRY STAKE ({pool.entryFee})
        </button>
        <button
          onClick={onDeepDive}
          className="flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-2 text-[10px] font-bold tracking-widest text-zinc-400 transition-colors hover:text-white"
        >
          DEEP-DIVE <ChevronRight size={11} />
        </button>
      </div>
    </article>
  );
}

function PoolSummary({
  poolId,
  onStake,
}: {
  poolId: string;
  onStake: () => void;
}) {
  const pool = useMarketStore((s) => s.pools.find((p) => p.id === poolId));
  if (!pool) return null;

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
      <h2 className="text-xs font-bold tracking-wide">{pool.title}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Cell label="POT" value={`${pool.pot}`} highlight />
        <Cell label="ENTRY" value={`${pool.entryFee}`} />
        <Cell label="ATHLETES" value={`${pool.participants.length}`} />
      </div>
      <button
        onClick={onStake}
        className="mt-4 w-full rounded-md border border-zinc-800 py-2 text-[10px] font-bold tracking-widest text-zinc-300 transition-colors hover:border-[#00FF66]/50 hover:text-[#00FF66]"
      >
        STAKE INTO THIS POOL
      </button>
    </section>
  );
}

function Cell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-900 bg-zinc-900/40 py-2">
      <div className="text-[8px] tracking-widest text-zinc-500">{label}</div>
      <div
        className="mt-0.5 text-sm font-bold"
        style={{ color: highlight ? "#00FF66" : "#fff" }}
      >
        {value}
      </div>
    </div>
  );
}
