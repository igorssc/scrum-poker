/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // SEO optimizations
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Generate dynamic files at build time
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
    ];
  },

  // Headers for better SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
