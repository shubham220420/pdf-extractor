import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle canvas package for react-pdf
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Allow external images
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
