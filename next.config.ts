import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình cho phép cross-origin requests từ domain tùy chỉnh
  allowedDevOrigins: [
    'http://fe.langochung.me',
    'https://fe.langochung.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://127.0.0.1:3000'
  ],
  
  // Cấu hình bổ sung cho production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://fe.langochung.me' 
              : 'https://fe.langochung.me, http://fe.langochung.me, http://localhost:3000, https://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
