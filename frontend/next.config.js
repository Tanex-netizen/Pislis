/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration for Render
  output: 'export',
  
  // Image optimization with modern formats (unoptimized for static export)
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Use modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Optimize image sizes for common breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },

  // Performance optimizations
  reactStrictMode: true,
  
  // Enable compression
  compress: true,

  // Optimize production builds
  swcMinify: true,

  // PoweredByHeader removal for security
  poweredByHeader: false,

  // Optimize font loading
  optimizeFonts: true,

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Headers for CDN caching on Vercel
  async headers() {
    // In development, aggressive caching (especially `immutable` for `/_next/static/*`)
    // can cause the browser to keep stale dev bundles and break HMR/runtime.
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        // Cache static assets aggressively
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|mp4|webm)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache JS/CSS with revalidation
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
