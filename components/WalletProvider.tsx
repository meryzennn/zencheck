"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
// Import wallet adapter default styles
import "@solana/wallet-adapter-react-ui/styles.css";

function WalletToast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "error" | "info";
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-xl ${
          type === "error"
            ? "bg-danger/10 border-danger/30 shadow-danger/10"
            : "bg-primary/10 border-primary/30 shadow-primary/10"
        }`}
      >
        <span
          className={`material-symbols-outlined text-lg ${
            type === "error" ? "text-danger" : "text-primary"
          }`}
        >
          {type === "error" ? "warning" : "info"}
        </span>
        <span className="text-white text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-white transition-colors cursor-pointer ml-2"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "info";
  } | null>(null);

  // Use Alchemy RPC if available, otherwise public mainnet
  const endpoint = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    return apiKey
      ? `https://solana-mainnet.g.alchemy.com/v2/${apiKey}`
      : "https://api.mainnet-beta.solana.com";
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [],
  );

  const onError = useCallback((error: WalletError) => {
    // Friendly messages for common wallet errors
    let message = "Wallet error occurred. Please try again.";

    if (
      error.name === "WalletConnectionError" ||
      error.message?.includes("rejected")
    ) {
      message = "Wallet connection was declined.";
    } else if (error.name === "WalletNotReadyError") {
      message = "Wallet not found. Please install Phantom or Solflare.";
    } else if (error.name === "WalletDisconnectedError") {
      message = "Wallet disconnected.";
    } else if (error.name === "WalletTimeoutError") {
      message = "Connection timed out. Please try again.";
    }

    setToast({ message, type: "error" });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>
          {children}
          {toast && (
            <WalletToast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
