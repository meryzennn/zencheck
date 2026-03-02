import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  return {
    title: `Token ${address.slice(0, 4)}...${address.slice(-4)}`,
    description: `Check the safety of Solana token contract ${address}. Analyze liquidity locks, mint authority, and holder distribution.`,
    openGraph: {
      title: `Rug Check: Token ${address.slice(0, 4)}...${address.slice(-4)} | ZenRugCheck`,
      description: `View full risk analysis for Solana token ${address}. Don't get rugged.`,
      url: `https://zenrugcheck.vercel.app/token/${address}`,
    },
  };
}

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
