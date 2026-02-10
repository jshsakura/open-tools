import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    output: 'standalone',
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                stream: false,
            };
        }
        return config;
    },
};

export default withNextIntl(nextConfig);
