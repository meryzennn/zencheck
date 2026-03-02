import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
          Terms of <span className="text-primary">Service</span>
        </h1>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Disclaimer: Not Financial Advice
            </h3>
            <p className="text-text-primary">
              The information provided by ZenRugCheck is for informational and
              educational purposes only. It should not be considered as
              financial, investment, or trading advice. Cryptocurrency markets
              are highly volatile, and you should always conduct your own
              research (DYOR) before making any investment decisions.
            </p>
          </div>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the ZenRugCheck application, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our services.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              2. Description of Service
            </h2>
            <p>
              ZenRugCheck is a web application that provides analysis, risk
              assessments, and portfolio tracking for tokens on the Solana
              blockchain. We aggregate data from various public sources and
              third-party APIs to generate automated reports.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              3. Accuracy of Information
            </h2>
            <p className="mb-4">
              While we strive to provide accurate and up-to-date information,
              ZenRugCheck does not warrant the completeness, reliability, or
              accuracy of the data presented. The blockchain environment is
              dynamic:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Risk scores are fully automated algorithms and may produce false
                positives or false negatives.
              </li>
              <li>
                A "Low Risk" score does not guarantee a token is safe from rug
                pulls, exploits, or severe price drops.
              </li>
              <li>
                Market data (prices, liquidity, volume) may be delayed or
                subject to discrepancies from third-party providers.
              </li>
            </ul>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall ZenRugCheck, its developers, or affiliates be
              liable for any direct, indirect, incidental, consequential, or
              punitive damages arising out of your use of or inability to use
              the service. You are solely responsible for your own trading
              decisions and any resulting financial losses.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              5. User Warranties
            </h2>
            <p>
              By using ZenRugCheck, you warrant that you understand the inherent
              risks associated with decentralized finance (DeFi) and
              cryptocurrencies. You agree not to use the service for any illegal
              or unauthorized purpose.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              6. Modifications to the Service
            </h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or
              permanently, the service (or any part thereof) with or without
              notice. We shall not be liable to you or to any third party for
              any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <div className="text-sm mt-12 text-center text-text-secondary">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
