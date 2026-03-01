"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchInputProps {
  compact?: boolean;
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export default function SearchInput({ compact = false }: SearchInputProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    const trimmed = address.trim();
    if (!trimmed) return;
    if (!isValidSolanaAddress(trimmed)) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }
    setError(false);
    router.push(`/token/${trimmed}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (compact) {
    return (
      <div
        className={`group relative flex items-center w-full h-10 rounded-lg bg-surface-dark border transition-all duration-300 glow-input ${
          error ? "border-danger shake" : "border-border-dark"
        }`}
      >
        <div className="pl-3 text-text-muted group-focus-within:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">search</span>
        </div>
        <input
          className="w-full h-full bg-transparent border-none text-white placeholder-text-muted focus:outline-none text-sm px-2"
          placeholder="Search token address..."
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center w-full h-14 md:h-16 rounded-xl bg-surface-dark border transition-all duration-300 glow-input ${
        error ? "border-danger shake" : "border-border-dark"
      }`}
    >
      <div className="pl-4 md:pl-6 text-text-muted group-focus-within:text-primary transition-colors">
        <span className="material-symbols-outlined text-2xl">search</span>
      </div>
      <input
        className="w-full h-full bg-transparent border-none text-white placeholder-text-muted focus:outline-none text-base md:text-lg px-4"
        placeholder="Enter token address (e.g. 7ey...)"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="pr-2">
        <button
          onClick={handleSubmit}
          className="h-10 md:h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
