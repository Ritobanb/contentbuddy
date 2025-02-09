/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core optimizations
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    minimumCacheTTL: 60,
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      }
    }
    return config
  },
  devIndicators: {
    buildActivity: false,
  },
}

module.exports = nextConfig
