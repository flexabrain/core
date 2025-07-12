/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost', 'flexabrain.com'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'FlexaBrain Core',
    NEXT_PUBLIC_APP_VERSION: '3.0.0',
  },
  // Remove deprecated options
  experimental: {
    // Remove appDir as it's now default in Next.js 14+
  },
  // Add health check endpoint for Docker
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

module.exports = nextConfig;