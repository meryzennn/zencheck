import SearchInput from "@/components/SearchInput";
import GlassPanel from "@/components/GlassPanel";
import RiskBadge from "@/components/RiskBadge";
import Link from "next/link";

const features = [
  {
    icon: "verified_user",
    iconColor: "text-secondary",
    title: "Authority Checks",
    description:
      "Instantly verify mint authority and freeze authority status. Know if the dev can print more tokens or freeze your wallet.",
  },
  {
    icon: "water_drop",
    iconColor: "text-primary",
    title: "Liquidity Analysis",
    description:
      "Detailed breakdown of LP burn status and locked liquidity percentages. Don't fall for fake liquidity pools.",
  },
  {
    icon: "pie_chart",
    iconColor: "text-danger",
    title: "Holder Distribution",
    description:
      "Detect whale wallets and dangerous supply concentration. Visualize the top 10 holders and sniper bot activity.",
  },
];

const recentScans = [
  {
    name: "$BONK",
    letter: "B",
    gradient: "from-orange-400 to-yellow-600",
    address: "DezX...p854",
    time: "Just now",
    score: 98,
    mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  },
  {
    name: "$PEPE",
    letter: "P",
    gradient: "from-green-500 to-blue-600",
    address: "25hK...99xQ",
    time: "2 mins ago",
    score: 12,
    mintAddress: "25hKfiMWWXWoJQCATgMDfeyzs1rCVGvDHGewjnpYp854",
  },
  {
    name: "$WIF",
    letter: "W",
    gradient: "from-pink-500 to-purple-600",
    address: "EKpQ...112a",
    time: "5 mins ago",
    score: 65,
    mintAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  },
  {
    name: "$SOL",
    letter: "S",
    gradient: "from-blue-400 to-indigo-600",
    address: "So11...1111",
    time: "12 mins ago",
    score: 100,
    mintAddress: "So11111111111111111111111111111111111111112",
  },
];

const popularTokens = [
  { symbol: "$BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { symbol: "$WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  {
    symbol: "$POPCAT",
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative py-20 px-4 md:py-32 flex flex-col items-center justify-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center gap-6">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-border-dark text-xs font-medium text-secondary mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            Live Solana Scanner Active
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] glow-text">
            Stay Zen.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-white to-primary">
              Don&apos;t Get Rugged.
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl font-light">
            Analyze any Solana token address instantly for liquidity locks, mint
            authority, and holder distribution risks before you ape in.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl mt-8">
            <SearchInput />
            <div className="flex gap-4 mt-4 justify-center text-xs text-text-muted">
              <span>Popular:</span>
              {popularTokens.map((t) => (
                <Link
                  key={t.symbol}
                  href={`/token/${t.address}`}
                  className="cursor-pointer hover:text-secondary transition-colors"
                >
                  {t.symbol}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-4 mb-10">
          <h2 className="text-3xl font-bold text-white">Deep Dive Analytics</h2>
          <p className="text-text-secondary">
            Comprehensive rug-check algorithms designed to keep your SOL safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <GlassPanel key={f.title} hover className="p-8 flex flex-col gap-4">
              <div
                className={`w-12 h-12 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center ${f.iconColor} group-hover:scale-110 transition-transform`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {f.icon}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* Recent Scans */}
      <section className="w-full max-w-7xl px-6 py-12 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Scans</h2>
          <Link
            href="/trending"
            className="text-primary text-sm font-medium hover:text-white transition-colors flex items-center gap-1"
          >
            View All{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        <GlassPanel className="overflow-hidden border border-border-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark/50 border-b border-border-dark text-text-secondary text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Token</th>
                  <th className="px-6 py-4 font-medium">Address</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">
                    Time Scanned
                  </th>
                  <th className="px-6 py-4 font-medium text-right">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-sm">
                {recentScans.map((scan) => (
                  <tr
                    key={scan.name}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${scan.gradient} flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {scan.letter}
                        </div>
                        <span className="font-bold text-white">
                          {scan.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">
                      {scan.address}
                    </td>
                    <td className="px-6 py-4 text-text-secondary hidden sm:table-cell">
                      {scan.time}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RiskBadge score={scan.score} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/token/${scan.mintAddress}`}>
                        <button className="text-text-secondary hover:text-white transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">
                            arrow_forward_ios
                          </span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
