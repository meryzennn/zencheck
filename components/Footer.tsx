"use client";

import { useState } from "react";

const socialLinks = [
  {
    name: "SocialHub",
    href: "https://0x5zen.vercel.app",
    label: "0x5zen.vercel.app",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.6 9h16.8M3.6 15h16.8"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"
        />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/meryzennn",
    label: "GitHub",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/0x5zen",
    label: "X (Twitter)",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Discord Server",
    href: "https://discord.gg/XV9bjGxwD5",
    label: "Discord",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const footerLinks = [
  { name: "How It Works", href: "/how-it-works" },
  { name: "Trending", href: "/trending" },
];

export default function Footer() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <footer className="relative w-full border-t border-border-dark bg-bg-dark overflow-hidden">
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[60px] bg-primary/5 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-lg">
                  shield_lock
                </span>
              </div>
              <span className="text-xl font-bold text-text-primary tracking-tight">
                Zen<span className="text-primary">Check</span>
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Your trusted on-chain guardian for Solana. We analyze smart
              contracts, liquidity patterns, and holder distributions so you can
              trade with confidence.
            </p>
            <p className="text-text-muted text-xs italic">
              &quot;Don&apos;t trust, verify.&quot; — The blockchain mantra.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-text-secondary font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-text-muted text-sm hover:text-primary transition-colors duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-text-muted group-hover:bg-primary group-hover:shadow-[0_0_6px_rgba(168,85,247,0.5)] transition-all duration-200" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect / Social */}
          <div className="space-y-4">
            <h4 className="text-text-secondary font-semibold text-sm uppercase tracking-wider">
              Connect With Us
            </h4>
            <p className="text-text-muted text-sm leading-relaxed">
              Join the community, report bugs, or just say hello. We&apos;re
              building the safest way to explore Solana tokens.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  onMouseEnter={() => setHoveredSocial(social.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`
                    relative group flex items-center justify-center w-10 h-10 rounded-xl 
                    border transition-all duration-300 cursor-pointer
                    ${
                      hoveredSocial === social.name
                        ? "bg-primary/15 border-primary/40 text-primary shadow-lg shadow-primary/15 -translate-y-0.5"
                        : "bg-surface-dark/50 border-border-dark text-text-muted hover:text-text-secondary"
                    }
                  `}
                >
                  {social.icon}
                  {/* Tooltip */}
                  <span
                    className={`
                      absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg 
                      bg-surface-dark border border-border-dark text-xs text-text-secondary 
                      whitespace-nowrap pointer-events-none transition-all duration-200
                      ${
                        hoveredSocial === social.name
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-1"
                      }
                    `}
                  >
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border-dark to-transparent mb-6" />

        {/* Bottom bar */}
      </div>
    </footer>
  );
}
