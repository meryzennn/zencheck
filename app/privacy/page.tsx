import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
          Privacy <span className="text-primary">Policy</span>
        </h1>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              When you use ZenCheck, we may collect the following types of
              information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Public Blockchain Data:</strong> We access and analyze
                public data on the Solana blockchain, including token contracts,
                transaction histories, and wallet balances.
              </li>
              <li>
                <strong>Wallet Addresses:</strong> If you connect your
                non-custodial wallet (e.g., Phantom, Solflare), we securely read
                your public wallet address to provide portfolio tracking
                features. We do not have access to your private keys.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect anonymous usage
                statistics to improve our services and user experience.
              </li>
            </ul>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the collected information solely for the purpose of
              providing and improving the ZenCheck service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To provide real-time token analysis and rug-pull risk
                assessments.
              </li>
              <li>
                To display your connected wallet's portfolio and transaction
                history.
              </li>
              <li>
                To maintain and improve the performance and security of our
                application.
              </li>
            </ul>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              3. Third-Party Services
            </h2>
            <p>
              ZenCheck utilizes third-party APIs, such as DexScreener and public
              Solana RPC nodes, to fetch market data and blockchain information.
              While we strive to use reputable providers, we are not responsible
              for the privacy practices of these third-party services.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect the
              information we collect. However, please be aware that no method of
              transmission over the internet or method of electronic storage is
              100% secure. Because we interact with decentralized networks,
              certain data is inherently public.
            </p>
          </section>

          <section className="bg-surface-dark/50 border border-border-dark rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              5. Changes to This Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page.
              You are advised to review this Privacy Policy periodically for any
              changes.
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
