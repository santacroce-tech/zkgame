const UnoCSS = require('unocss/webpack').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    }
    config.plugins.push(UnoCSS())
    return config
  },
}

module.exports = nextConfig
