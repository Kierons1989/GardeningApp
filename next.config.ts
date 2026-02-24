import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'perenual.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**.rhs.org.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.crocus.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.thompson-morgan.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.davidaustinroses.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.gardenersworld.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
