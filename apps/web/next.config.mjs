/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@fount/shared'],
  // Force the API base URL — overrides any injected env var (org secrets, CI, etc.)
  env: {
    NEXT_PUBLIC_API_URL: '/api/v1',
  },
  images: {
    unoptimized: true, // required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
