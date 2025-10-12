import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  // ✅ Images config
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  // ✅ Output tracing root
  outputFileTracingRoot: path.resolve(__dirname, '../../'),

  // ✅ TypeScript and ESLint
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // ✅ Turbopack loader
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER]
      }
    }
  },

  // ✅ NEW: Static export support in Next.js 15
  // output: 'export', // This replaces next export
};

export default nextConfig;
