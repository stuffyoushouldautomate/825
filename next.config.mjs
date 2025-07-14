/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway-specific optimizations
  output: 'standalone',
  // Server external packages
  serverExternalPackages: ['@upstash/redis'],



  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**' // Google user content often follows this pattern
      }
    ],
    // Railway-specific image optimization
    unoptimized: process.env.NODE_ENV === 'development'
  },

  // Environment variables for Railway
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Railway-specific headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Railway-specific redirects
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: true
      }
    ]
  }
}

export default nextConfig
