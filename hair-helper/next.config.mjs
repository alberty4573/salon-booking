/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sydneyoperahouse.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
