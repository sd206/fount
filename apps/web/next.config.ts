import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fount/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
  },
};

export default nextConfig;
