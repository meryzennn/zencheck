"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import SearchInput from "@/components/SearchInput";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const prevPathname = useRef(pathname);

  const walletAddress = publicKey?.toBase58() || "";
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "";

  // Route change loading bar
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (prevPathname.current !== pathname) {
      setTimeout(() => setPageLoading(true), 0);
      prevPathname.current = pathname;
      timer = setTimeout(() => setPageLoading(false), 600);
    }
    return () => clearTimeout(timer);
  }, [pathname]);

  // Fetch SOL balance when connected
  useEffect(() => {
    if (!publicKey) {
      setTimeout(() => setSolBalance(null), 0);
      return;
    }
    let cancelled = false;
    async function fetchBalance() {
      try {
        const balance = await connection.getBalance(publicKey!);
        if (!cancelled) setSolBalance(balance / 1e9);
      } catch {
        if (!cancelled) setSolBalance(null);
      }
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setDropdownOpen(false);
  }, [disconnect]);

  interface NavLink {
    href?: string;
    label?: string;
    icon?: string;
    separator?: boolean;
  }

  const navLinks: NavLink[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/trending", label: "Trending", icon: "local_fire_department" },
    { href: "/how-it-works", label: "How it Works", icon: "help_outline" },
    ...(connected
      ? [
          { separator: true },
          { href: "/portfolio", label: "Portfolio", icon: "account_balance" },
        ]
      : []),
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-border-dark bg-background/80 backdrop-blur-lg shadow-sm">
      {/* Loading Bar */}
      {pageLoading && (
        <div className="absolute top-0 left-0 w-full h-[2px] z-[60] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full header-loading-bar" />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-white group">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:rotate-3">
            <span className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110">
              shield_lock
            </span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary">
            ZenCheck
          </h2>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-xl border border-white/10">
            {navLinks.map((link, index) => {
              if (link.separator) {
                return (
                  <div
                    key={`sep-${index}`}
                    className="w-px h-5 bg-white/20 mx-1"
                  />
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`relative text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 group flex items-center gap-2 ${
                    isActive
                      ? "text-white bg-primary/20 shadow-inner"
                      : "text-text-secondary hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-base transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-text-muted group-hover:text-primary group-hover:scale-110"
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full" />
                  )}
                  {/* Hover underline */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-4 h-[2px] bg-primary/50 rounded-full transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {!isLanding && (
            <div className="w-64">
              <SearchInput compact />
            </div>
          )}

          {/* Wallet Button — Desktop */}
          {connected && publicKey ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full h-10 px-4 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 hover:border-primary/60 hover:from-primary/30 hover:to-primary/20 text-white text-sm font-medium transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
              >
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-mono text-xs group-hover:tracking-wider transition-all duration-300">
                  {shortAddress}
                </span>
                <span className="material-symbols-outlined text-sm text-text-secondary group-hover:text-white transition-all duration-300 group-hover:rotate-180">
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-14 w-72 rounded-xl border border-border-dark shadow-2xl shadow-primary/10 animate-slide-down z-50 overflow-hidden"
                  style={{
                    background: "rgba(15, 23, 42, 0.92)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                >
                  {/* Wallet Header */}
                  <div className="p-4 border-b border-border-dark bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-lg">
                          account_balance_wallet
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold">
                          Connected
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-mono text-xs truncate">
                            {shortAddress}
                          </span>
                          <button
                            onClick={copyAddress}
                            className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                            title="Copy address"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copied ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SOL Balance */}
                    <div className="bg-surface-dark/80 rounded-lg p-3 border border-border-dark">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs">Balance</span>
                        <a
                          href={`https://solscan.io/account/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-[10px] hover:underline flex items-center gap-0.5"
                        >
                          Solscan
                          <span className="material-symbols-outlined text-[10px]">
                            open_in_new
                          </span>
                        </a>
                      </div>
                      <p className="text-white font-bold text-lg mt-1">
                        {solBalance !== null
                          ? `${solBalance.toFixed(4)} SOL`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/portfolio"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer group"
                    >
                      <span className="material-symbols-outlined text-lg text-primary group-hover:scale-110 transition-transform duration-200">
                        account_balance
                      </span>
                      <div>
                        <span className="block font-medium">
                          View Portfolio
                        </span>
                        <span className="block text-xs text-text-muted">
                          Your tokens & rug checks
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger/80 hover:text-danger hover:bg-danger/5 transition-all duration-200 w-full text-left cursor-pointer group"
                    >
                      <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform duration-200">
                        logout
                      </span>
                      <span className="font-medium">Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="material-symbols-outlined text-lg relative z-10 group-hover:rotate-12 transition-transform duration-300">
                account_balance_wallet
              </span>
              <span className="relative z-10">Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span
            className="material-symbols-outlined transition-transform duration-300"
            style={{ transform: mobileOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden pb-4 border-t border-border-dark pt-4 px-6 flex flex-col gap-3 animate-slide-down">
          {navLinks.map((link, index) => {
            if (link.separator) {
              return (
                <div
                  key={`sep-${index}`}
                  className="w-full h-px bg-white/10 my-2"
                />
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href!}
                className={`flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "text-white bg-white/5"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.03]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    isActive ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
          {!isLanding && <SearchInput compact />}

          {/* Wallet Button — Mobile */}
          {connected && publicKey ? (
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 bg-surface-dark/80 rounded-lg p-3 border border-border-dark">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">
                    account_balance_wallet
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-mono text-xs">
                      {shortAddress}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {copied ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">
                    {solBalance !== null
                      ? `${solBalance.toFixed(4)} SOL`
                      : "Loading..."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/portfolio"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg h-10 bg-primary/10 border border-primary/20 text-primary text-sm font-bold transition-all cursor-pointer hover:bg-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">
                    account_balance
                  </span>
                  Portfolio
                </Link>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-danger/10 border border-danger/20 text-danger text-sm font-bold transition-all cursor-pointer hover:bg-danger/20"
                >
                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setVisible(true);
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all w-full cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-lg">
                account_balance_wallet
              </span>
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </header>
  );
}
