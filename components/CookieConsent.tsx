"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already consented or declined
    const hasConsented = localStorage.getItem("zenrugcheck-cookie-consent");
    if (!hasConsented) {
      // Small delay for a cool slide-in effect when landing
      const timer = setTimeout(() => {
        setMounted(true);
        // Delay setting 'show' to true slightly after mounting to trigger CSS transition
        setTimeout(() => setShow(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setShow(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => {
      setMounted(false);
      localStorage.setItem("zenrugcheck-cookie-consent", "accepted");
    }, 500);
  };

  const handleDecline = () => {
    setShow(false);
    setTimeout(() => {
      setMounted(false);
      localStorage.setItem("zenrugcheck-cookie-consent", "declined");
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100%-3rem)] md:w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-bottom-right ${
        show
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-12 opacity-0 scale-95"
      }`}
    >
      <div className="bg-surface-dark/80 backdrop-blur-xl border border-border-dark shadow-[0_8px_32px_rgba(168,85,247,0.15)] rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-primary text-xl">
                cookie
              </span>
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-1 text-sm tracking-wide">
                Cookie Consent
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                We use cookies to enhance your experience and analyze our
                traffic. Are you okay with this?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 w-full">
            <button
              onClick={handleDecline}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 border border-border-dark hover:border-text-muted/30 transition-all duration-300 flex-1"
            >
              No Thanks
            </button>
            <button
              onClick={handleAccept}
              className="relative overflow-hidden px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-[1.02] flex-1 text-center group border border-primary/50"
            >
              {/* Shine effect on hover */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 translate-x-[-100%] group-hover:opacity-100 group-hover:translate-x-[100%] transition-all duration-700 ease-in-out"></div>
              <span className="relative z-10 drop-shadow-md">
                Yes, I Accept
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
