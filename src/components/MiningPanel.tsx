"use client";

import * as Slider from "@radix-ui/react-slider";
import * as Progress from "@radix-ui/react-progress";
import { Pickaxe } from "lucide-react";
import { useEffect, useState } from "react";
import { useActiveUser, useMarketStore } from "@/store/MarketStoreProvider";
import {
  calculateNormalizedScore,
  formatPace,
  multiplierFromBaseline,
} from "@/utils/deltaEngine";
import { useToast } from "@/components/ToastProvider";

const MIN_PACE = 240;
const MAX_PACE = 1200;

export function MiningPanel() {
  const active = useActiveUser();
  const mineSweat = useMarketStore((s) => s.mineSweat);
  const toast = useToast();
  const [pace, setPace] = useState(active.currentSeconds);

  useEffect(() => {
    setPace(active.currentSeconds);
  }, [active.id, active.currentSeconds]);

  const preview = calculateNormalizedScore(active.baselineSeconds, pace);
  const gain = preview.finalScore >= 0;
  const color = gain ? "#00FF66" : "#FF3344";

  const logRun = () => {
    const { minted, score } = mineSweat(pace);
    toast({
      title: `+${minted} $SWEAT MINTED`,
      description: `${active.handle} logged ${formatPace(pace)}/mi · sweat score ${
        score >= 0 ? "+" : ""
      }${score.toFixed(2)}`,
      tone: score >= 0 ? "gain" : "loss",
    });
  };

  const progress = Math.min(100, Math.max(0, preview.rawDelta * 5));

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-zinc-300 uppercase">
          <Pickaxe size={13} className="text-[#00FF66]" /> Mine Sweat Equity
        </h2>
        <span className="text-[9px] tracking-widest text-zinc-500">
          TIER x{multiplierFromBaseline(active.baselineSeconds).toFixed(1)}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <label
            htmlFor="pace-input"
            className="text-[10px] tracking-widest text-zinc-500 uppercase"
          >
            Log Workout Pace (sec/mile)
          </label>
          <input
            id="pace-input"
            type="number"
            min={MIN_PACE}
            max={MAX_PACE}
            value={pace}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isNaN(next))
                setPace(Math.min(MAX_PACE, Math.max(MIN_PACE, next)));
            }}
            className="w-20 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-right text-xs font-bold outline-none focus:border-[#00FF66]/50"
          />
        </div>

        <Slider.Root
          className="relative mt-4 flex h-5 w-full touch-none items-center select-none"
          min={MIN_PACE}
          max={MAX_PACE}
          step={5}
          value={[pace]}
          onValueChange={([v]) => setPace(v)}
          aria-label="Workout pace in seconds per mile"
        >
          <Slider.Track className="relative h-1 grow rounded-full bg-zinc-800">
            <Slider.Range className="absolute h-full rounded-full bg-[#00FF66]/70" />
          </Slider.Track>
          <Slider.Thumb className="block h-4 w-4 rounded-full border-2 border-[#00FF66] bg-[#090A0C] shadow-[0_0_10px_#00FF6688] outline-none" />
        </Slider.Root>

        <div className="mt-1 flex justify-between text-[9px] text-zinc-600">
          <span>{formatPace(MIN_PACE)}/mi</span>
          <span className="font-bold text-white">{formatPace(pace)}/mi</span>
          <span>{formatPace(MAX_PACE)}/mi</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="RAW Δ" value={`${preview.rawDelta.toFixed(2)}%`} color={color} />
        <Stat label="MULT" value={`x${preview.multiplier.toFixed(1)}`} />
        <Stat
          label="SWEAT SCORE"
          value={`${gain ? "+" : ""}${preview.finalScore.toFixed(2)}`}
          color={color}
        />
      </div>

      <Progress.Root
        value={progress}
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800"
      >
        <Progress.Indicator
          className="h-full transition-transform duration-300"
          style={{
            width: "100%",
            background: color,
            transform: `translateX(-${100 - progress}%)`,
          }}
        />
      </Progress.Root>

      <button
        onClick={logRun}
        className="mt-4 w-full rounded-md border border-[#00FF66]/50 bg-[#00FF66]/10 py-2.5 text-[11px] font-bold tracking-widest text-[#00FF66] transition-all hover:bg-[#00FF66]/20 active:scale-[0.98]"
      >
        LOG RUN (+ MINT TOKENS)
      </button>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded border border-zinc-900 bg-zinc-900/40 py-2">
      <div className="text-[8px] tracking-widest text-zinc-500">{label}</div>
      <div className="mt-0.5 text-xs font-bold" style={{ color: color ?? "#fff" }}>
        {value}
      </div>
    </div>
  );
}
