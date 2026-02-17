/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC for faster minification
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains (recommended for news aggregators)
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP domains
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
