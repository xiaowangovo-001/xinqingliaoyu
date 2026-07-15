import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/xiaozhuangovo',
  assetPrefix: '/xiaozhuangovo',
};

export default nextConfig;
