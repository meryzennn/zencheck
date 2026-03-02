import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Portfolio",
  description:
    "View your Solana token portfolio and instantly run rug checks on all your holdings.",
  openGraph: {
    title: "My Portfolio | ZenRugCheck",
    description:
      "View your Solana token portfolio and instantly run rug checks on all your holdings.",
    url: "https://zenrugcheck.vercel.app/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
