module.exports = {
  /** @type {import('next').NextConfig} */
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions:["js","jsx","ts","tsx"],
  webpack: config =>{
    config.resolve.fallback = {
      fs:false
    }
    return config
  }
}
// const nextConfig = {
// }

// module.exports = nextConfig
