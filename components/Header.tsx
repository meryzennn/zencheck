"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trending", label: "Trending" },
    { href: "/api-docs", label: "API" },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border-dark px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-white group">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl">
              shield_lock
            </span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">
            ZenCheck
          </h2>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isLanding && (
            <div className="w-64">
              <SearchInput compact />
            </div>
          )}

          <button className="flex items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-105 cursor-pointer">
            Connect Wallet
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border-dark pt-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-white"
                  : "text-text-secondary hover:text-white"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isLanding && <SearchInput compact />}
          <button className="flex items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all w-full cursor-pointer">
            Connect Wallet
          </button>
        </div>
      )}
    </header>
  );
}
