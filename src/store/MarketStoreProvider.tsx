"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import {
  createMarketStore,
  type MarketState,
  type MarketStore,
} from "@/store/useMarketStore";

const MarketStoreContext = createContext<MarketStore | null>(null);
const HydrationContext = createContext(false);

export function MarketStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<MarketStore | null>(null);
  if (storeRef.current === null) storeRef.current = createMarketStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;
    void store.persist.rehydrate();
    setHydrated(true);
  }, []);

  return (
    <MarketStoreContext.Provider value={storeRef.current}>
      <HydrationContext.Provider value={hydrated}>
        {children}
      </HydrationContext.Provider>
    </MarketStoreContext.Provider>
  );
}

export function useMarketStore<T>(selector: (state: MarketState) => T): T {
  const store = useContext(MarketStoreContext);
  if (!store)
    throw new Error("useMarketStore must be used inside MarketStoreProvider");
  return useStore(store, selector);
}

/** False during SSR and the first client paint, true once localStorage is read. */
export function useHydrated(): boolean {
  return useContext(HydrationContext);
}

export function useActiveUser() {
  return useMarketStore((s) => s.users.find((u) => u.id === s.activeUserId)!);
}
