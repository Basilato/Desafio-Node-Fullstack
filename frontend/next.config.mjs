/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    proxyTimeout: 30_000,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
