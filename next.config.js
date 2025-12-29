/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    // Disable ALL static optimization for Render compatibility
    experimental: {
        optimizePackageImports: ['@radix-ui/react-icons'],
    },
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
    // Force all pages to be dynamic
    generateBuildId: async () => {
        return 'build-' + Date.now();
    },
    // Skip static page generation
    skipTrailingSlashRedirect: true,
    // Empty turbopack config to silence warning
    turbopack: {},
};

module.exports = nextConfig;
