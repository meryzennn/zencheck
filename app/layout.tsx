import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletContextProvider from "@/components/WalletProvider";

import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ZenRugCheck",
    default: "ZenRugCheck | Solana Token Rug Checker",
  },
  description:
    "Analyze any Solana token address instantly for liquidity locks, mint authority, and holder distribution risks before you ape in.",
  keywords: [
    "solana",
    "rug checker",
    "token analyzer",
    "crypto",
    "defi",
    "liquidity",
    "solana rug check",
  ],
  openGraph: {
    title: "ZenRugCheck | Solana Token Rug Checker",
    description:
      "Analyze any Solana token address instantly for liquidity locks, mint authority, and holder distribution risks before you ape in.",
    url: "https://zenrugcheck.vercel.app",
    siteName: "ZenRugCheck",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenRugCheck | Solana Token Rug Checker",
    description:
      "Analyze any Solana token address instantly for liquidity locks, mint authority, and holder distribution risks before you ape in.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-display antialiased min-h-screen flex flex-col bg-bg-dark text-text-primary`}
      >
        <WalletContextProvider>
          <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
            <Header />
            <CookieConsent />
            <main className="flex-grow flex flex-col items-center w-full pt-[76px]">
              {children}
            </main>
            <Footer />
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
