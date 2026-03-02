import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Solana Tokens",
  description:
    "Discover the top trending tokens on Solana and instantly check their safety scores and risk profiles.",
  openGraph: {
    title: "Trending Solana Tokens | ZenRugCheck",
    description:
      "Discover the top trending tokens on Solana and instantly check their safety scores and risk profiles.",
    url: "https://zenrugcheck.vercel.app/trending",
  },
};

export default function TrendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
