"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Coins, X } from "lucide-react";
import { useActiveUser, useMarketStore } from "@/store/MarketStoreProvider";
import type { Pool } from "@/store/useMarketStore";
import { useToast } from "@/components/ToastProvider";

const REASONS: Record<string, string> = {
  ALREADY_STAKED: "You are already staked in this pool.",
  INSUFFICIENT_SWEAT: "Not enough $SWEAT. Mine more sweat equity first.",
  NOT_FOUND: "Pool unavailable.",
};

export function StakeDialog({
  pool,
  open,
  onOpenChange,
}: {
  pool: Pool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const active = useActiveUser();
  const stakePool = useMarketStore((s) => s.stakePool);
  const toast = useToast();
  const alreadyIn = pool.participants.includes(active.handle);

  const confirm = () => {
    const res = stakePool(pool.id);
    if (res.ok) {
      toast({
        title: `STAKED ${pool.entryFee} $SWEAT`,
        description: `${active.handle} entered ${pool.title}`,
      });
      onOpenChange(false);
      return;
    }
    toast({
      title: "STAKE REJECTED",
      description: REASONS[res.reason ?? "NOT_FOUND"],
      tone: "loss",
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-[#0C0D10] p-5 font-mono text-white shadow-[0_0_40px_rgba(0,255,102,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-sm font-bold tracking-widest uppercase">
                Enter Pool
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[11px] text-zinc-500">
                {pool.title}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="text-zinc-600 hover:text-white"
            >
              <X size={16} />
            </Dialog.Close>
          </div>

          <dl className="mt-4 space-y-2 text-[11px]">
            <Row label="ENTRY STAKE" value={`${pool.entryFee} $SWEAT`} />
            <Row label="CURRENT POT" value={`${pool.pot} $SWEAT`} />
            <Row label="ATHLETES" value={`${pool.participants.length}`} />
            <Row
              label="YOUR BALANCE"
              value={`${active.balance} $SWEAT`}
              color={active.balance >= pool.entryFee ? "#00FF66" : "#FF3344"}
            />
          </dl>

          <button
            onClick={confirm}
            disabled={alreadyIn}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-[#00FF66]/50 bg-[#00FF66]/10 py-2.5 text-[11px] font-bold tracking-widest text-[#00FF66] transition-all hover:bg-[#00FF66]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
          >
            <Coins size={13} />
            {alreadyIn ? "ALREADY STAKED" : `CONFIRM STAKE (${pool.entryFee})`}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
      <dt className="tracking-widest text-zinc-500">{label}</dt>
      <dd className="font-bold" style={{ color: color ?? "#fff" }}>
        {value}
      </dd>
    </div>
  );
}
