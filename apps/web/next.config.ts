import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack(config) {
    // Exclude the vendored stellar-social-sdk from webpack resolution
    // The SDK uses .js extensions on TypeScript files which break Next.js module resolution.
    // Auth is handled directly in use-auth.tsx without the SDK.
    config.resolve.alias = {
      ...config.resolve.alias,
      // Redirect any import of the broken sdk index to our stub
      [path.resolve(__dirname, 'stellar-social-sdk/src/index')]:
        path.resolve(__dirname, 'src/lib/stellar-social-sdk.ts'),
    };
    return config;
  },
};

export default nextConfig;
