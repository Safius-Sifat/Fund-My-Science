import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure webpack to handle CSP issues
  webpack: (config, { dev, isServer }) => {
    // In development, allow eval for better debugging
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },

  // Configure turbopack for better performance (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },

  // Configure output for static exports if needed
  output: 'standalone',

  // Configure image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        port: '',
        // pathname: '/storage/v1/object/public/**',
      },
    ],
  }
};

export default nextConfig;