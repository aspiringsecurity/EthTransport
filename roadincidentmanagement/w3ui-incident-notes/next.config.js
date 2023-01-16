/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // disable swc minification for now because it seems to break UploaderProvider
  swcMinify: false,
}

module.exports = nextConfig
