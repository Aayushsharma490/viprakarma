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
