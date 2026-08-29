"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";
import { TrendingUp, X } from "lucide-react";

interface ToastPayload {
  title: string;
  description?: string;
  tone?: "gain" | "loss";
}

const ToastContext = createContext<(payload: ToastPayload) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<(ToastPayload & { key: number })[]>([]);

  const push = useCallback((payload: ToastPayload) => {
    setItems((prev) => [...prev.slice(-2), { ...payload, key: Date.now() }]);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      <Toast.Provider swipeDirection="right" duration={3200}>
        {children}
        {items.map((item) => {
          const gain = item.tone !== "loss";
          return (
            <Toast.Root
              key={item.key}
              className="toast-root flex items-start gap-3 rounded-lg border bg-zinc-950/95 px-4 py-3 shadow-[0_0_24px_rgba(0,0,0,0.6)]"
              style={{
                borderColor: gain ? "#00ff6644" : "#ff334444",
                boxShadow: `0 0 24px ${gain ? "#00ff6622" : "#ff334422"}`,
              }}
              onOpenChange={(open) => {
                if (!open)
                  setItems((prev) => prev.filter((i) => i.key !== item.key));
              }}
            >
              <TrendingUp
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: gain ? "#00FF66" : "#FF3344" }}
              />
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-xs font-bold tracking-widest uppercase">
                  {item.title}
                </Toast.Title>
                {item.description ? (
                  <Toast.Description className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    {item.description}
                  </Toast.Description>
                ) : null}
              </div>
              <Toast.Close
                aria-label="Close"
                className="text-zinc-600 transition-colors hover:text-white"
              >
                <X size={14} />
              </Toast.Close>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2 font-mono outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
