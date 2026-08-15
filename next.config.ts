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
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'iretzfstridlksnlcqhz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  serverExternalPackages: ['drizzle-kit', 'drizzle-kit/api', 'pg', 'pg-pool', 'pgpass'],
  webpack: (config, { isServer, dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      }
    }

    if (isServer) {
      const externals = Array.isArray(config.externals) ? config.externals : []
      config.externals = [...externals, 'pg', 'pg-pool', 'pgpass', 'pg-protocol']
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        pgpass: false,
      }
    }

    return config
  },
}

const config = withPayload(nextConfig)

const excludes = config.outputFileTracingExcludes?.['**/*'] || []
config.outputFileTracingExcludes = {
  ...config.outputFileTracingExcludes,
  '**/*': excludes.filter((item) => !String(item).includes('drizzle-kit')),
}
config.outputFileTracingIncludes = {
  ...config.outputFileTracingIncludes,
  '**/*': [
    ...(config.outputFileTracingIncludes?.['**/*'] || []),
    'pg',
    'pg-pool',
    'pg-protocol',
    'pg-types',
  ],
}

export default config
