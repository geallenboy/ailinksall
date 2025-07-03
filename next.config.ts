import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/translate/i18n/request.ts");

// 安全头部配置
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    }
];

const nextConfig: NextConfig = {
    // 生产环境安全头部
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
    
    
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*"
            }
        ]
    },
    
    // 生产环境优化
    compress: true,
    poweredByHeader: false,
};

export default withNextIntl(nextConfig);
