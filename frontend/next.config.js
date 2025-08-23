/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid double rendering issues
  swcMinify: true,
  experimental: {
    turbo: false, // Disable Turbopack to avoid webpack conflicts
  },
  webpack: (config, { dev, isServer }) => {
    // Fix webpack module resolution issues
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      }
    }
    return config
  },
  async rewrites() {
    // Use backend service name for Docker container communication
    const apiUrl = process.env.NODE_ENV === 'production' ? 'http://backend:8080' : 'http://localhost:8080';
    
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
