/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  trailingSlash: false,
  transpilePackages: ['data'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Max-Age', value: '1728000' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
        ]
      }
    ];
  }
};
