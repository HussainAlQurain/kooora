/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid double rendering issues
  swcMinify: true,
  experimental: {
    // turbo: false, // Disable Turbopack to avoid webpack conflicts - removed as it's invalid
  },
  // Expose backend URL to the client with a sane default for local runs
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  },
  async rewrites() {
    // Prefer explicit env; default to localhost when not in Docker
    const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    
    return [
      {
        source: '/api/matches/upcoming',
        destination: `${apiUrl}/api/public/matches/upcoming`,
      },
      {
        source: '/api/matches/live',
        destination: `${apiUrl}/api/public/matches/live`,
      },
      {
        source: '/api/matches/today',
        destination: `${apiUrl}/api/public/matches/today`,
      },
      {
        source: '/api/matches',
        destination: `${apiUrl}/api/public/matches`,
      },
      {
        source: '/api/public/:path*',
        destination: `${apiUrl}/api/public/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['flagcdn.com', 'localhost'],
  },
}

module.exports = nextConfig
