import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { MarketStoreProvider } from "@/store/MarketStoreProvider";
import { ToastProvider } from "@/components/ToastProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DELTA//BET — Fitness Delta Prediction Markets",
  description:
    "Bet on relative improvement, not absolute speed. Tier-weighted sweat score markets.",
};

export const viewport: Viewport = {
  themeColor: "#090A0C",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} bg-[#090A0C] font-mono text-white antialiased`}
      >
        <MarketStoreProvider>
          <ToastProvider>
            <div className="mx-auto flex min-h-screen max-w-md flex-col border-x border-zinc-800 bg-[#090A0C] font-mono text-white">
              {children}
            </div>
          </ToastProvider>
        </MarketStoreProvider>
      </body>
    </html>
  );
}
