import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  serverExternalPackages: ['drizzle-kit', 'drizzle-kit/api', 'pg'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      }
    }
    return config
  },
}

const config = withPayload(nextConfig)

// Payload excludes drizzle-kit from standalone tracing; we need it to create tables on first boot.
const excludes = config.outputFileTracingExcludes?.['**/*'] || []
config.outputFileTracingExcludes = {
  ...config.outputFileTracingExcludes,
  '**/*': excludes.filter((item) => !String(item).includes('drizzle-kit')),
}
config.outputFileTracingIncludes = {
  ...config.outputFileTracingIncludes,
  '**/*': [
    ...(config.outputFileTracingIncludes?.['**/*'] || []),
    'drizzle-kit',
    'drizzle-kit/api',
  ],
}

export default config
