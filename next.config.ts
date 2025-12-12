import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
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
    turbopack: {},
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

export default nextConfig;
