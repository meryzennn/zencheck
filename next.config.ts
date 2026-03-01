import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dexscreener.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dd.dexscreener.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.dexscreener.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
