import GlassPanel from "@/components/GlassPanel";

export default function ApiDocsPage() {
  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar TOC */}
        <aside className="lg:col-span-1">
          <GlassPanel className="p-6 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contents
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "#getting-started", label: "Getting Started" },
                { href: "#authentication", label: "Authentication" },
                { href: "#analyze", label: "Analyze Token" },
                { href: "#trending", label: "Trending Tokens" },
                { href: "#rate-limits", label: "Rate Limits" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </GlassPanel>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                code
              </span>
              API Documentation
            </h1>
            <p className="text-text-secondary mt-2">
              Integrate ZenCheck&apos;s token analysis into your own
              applications.
            </p>
          </div>

          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-2xl font-bold text-white mb-4">
              Getting Started
            </h2>
            <GlassPanel className="p-6">
              <p className="text-text-secondary text-sm leading-relaxed">
                The ZenCheck API provides programmatic access to our token
                analysis engine. All endpoints return JSON and follow REST
                conventions. Base URL:
              </p>
              <div className="mt-4 p-4 rounded-lg bg-surface-dark border border-border-dark font-mono text-sm text-secondary">
                https://zencheck.app/api/v1
              </div>
            </GlassPanel>
          </section>

          {/* Authentication */}
          <section id="authentication">
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication
            </h2>
            <GlassPanel className="p-6">
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                All API requests require an API key passed as a header:
              </p>
              <div className="p-4 rounded-lg bg-surface-dark border border-border-dark font-mono text-sm overflow-x-auto">
                <span className="text-text-muted"># Example request</span>
                <br />
                <span className="text-primary">curl</span>{" "}
                <span className="text-text-secondary">-H</span>{" "}
                <span className="text-secondary">
                  &quot;Authorization: Bearer YOUR_API_KEY&quot;
                </span>{" "}
                \<br />
                &nbsp;&nbsp;
                <span className="text-white">
                  https://zencheck.app/api/v1/analyze?address=DezX...
                </span>
              </div>
              <p className="text-text-muted text-xs mt-3">
                Get your API key from your dashboard after connecting your
                wallet.
              </p>
            </GlassPanel>
          </section>

          {/* Analyze Endpoint */}
          <section id="analyze">
            <h2 className="text-2xl font-bold text-white mb-4">
              Analyze Token
            </h2>
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                  GET
                </span>
                <code className="text-white text-sm font-mono">
                  /api/v1/analyze
                </code>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Returns a comprehensive risk analysis for a given Solana token
                address.
              </p>

              {/* Parameters */}
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Query Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm mb-6">
                  <thead>
                    <tr className="border-b border-border-dark text-text-muted text-xs uppercase">
                      <th className="py-2 pr-4">Parameter</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Required</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-primary">
                        address
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">string</td>
                      <td className="py-3 pr-4 text-secondary">Yes</td>
                      <td className="py-3 text-text-secondary">
                        Solana token mint address
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Response */}
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Response Example
              </h4>
              <div className="p-4 rounded-lg bg-surface-dark border border-border-dark font-mono text-xs overflow-x-auto leading-relaxed">
                <pre className="text-text-secondary">
                  {JSON.stringify(
                    {
                      success: true,
                      data: {
                        name: "BONK",
                        symbol: "$BONK",
                        riskScore: 98,
                        riskLevel: "Safe",
                        mintAuthority: "revoked",
                        freezeAuthority: "revoked",
                        lpStatus: "burned",
                        liquidityUsd: 5425890,
                        topHolders: [
                          {
                            address: "Fxb9...2a8e",
                            percentage: 12.0,
                          },
                        ],
                      },
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </GlassPanel>
          </section>

          {/* Trending Endpoint */}
          <section id="trending">
            <h2 className="text-2xl font-bold text-white mb-4">
              Trending Tokens
            </h2>
            <GlassPanel className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                  GET
                </span>
                <code className="text-white text-sm font-mono">
                  /api/v1/trending
                </code>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                Returns the most-scanned tokens within a given timeframe.
              </p>

              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Query Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-dark text-text-muted text-xs uppercase">
                      <th className="py-2 pr-4">Parameter</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Required</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-primary">
                        timeframe
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">string</td>
                      <td className="py-3 pr-4 text-text-muted">No</td>
                      <td className="py-3 text-text-secondary">
                        1h, 6h, 24h, 7d (default: 24h)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-primary">
                        limit
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">number</td>
                      <td className="py-3 pr-4 text-text-muted">No</td>
                      <td className="py-3 text-text-secondary">
                        Number of tokens to return (default: 20, max: 100)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-4">Rate Limits</h2>
            <GlassPanel className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-dark text-text-muted text-xs uppercase">
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Rate Limit</th>
                      <th className="py-2">Daily Quota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    <tr>
                      <td className="py-3 pr-4 text-white font-medium">Free</td>
                      <td className="py-3 pr-4 text-text-secondary">
                        10 req/min
                      </td>
                      <td className="py-3 text-text-secondary">100 req/day</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-white font-medium">Pro</td>
                      <td className="py-3 pr-4 text-text-secondary">
                        60 req/min
                      </td>
                      <td className="py-3 text-text-secondary">
                        10,000 req/day
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">
                        Enterprise
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">
                        Unlimited
                      </td>
                      <td className="py-3 text-text-secondary">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </section>
        </div>
      </div>
    </div>
  );
}
