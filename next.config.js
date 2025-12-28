/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Completely disable static optimization
    experimental: {
        isrMemoryCacheSize: 0,
    },
    // Force all routes to be dynamic
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
    webpack: (config, { isServer }) => {
        // Ignore README.md and LICENSE files from @libsql packages
        config.module.rules.push({
            test: /\.(md|LICENSE)$/,
            type: 'asset/source',
        });

        config.ignoreWarnings = [
            { module: /node_modules\/@libsql/ },
        ];

        return config;
    },
};

module.exports = nextConfig;
