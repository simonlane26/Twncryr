import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Next.js and Clerk inject inline scripts; unsafe-inline is required until nonce support is added
  "script-src 'self' 'unsafe-inline' https://clerk.twncryr.com https://*.clerk.com https://*.clerk.accounts.dev",
  // Inline styles used throughout components
  "style-src 'self' 'unsafe-inline'",
  // Images: self, data URIs, UploadThing CDN, Clerk avatar CDN
  "img-src 'self' data: blob: https://utfs.io https://img.clerk.com https://*.uploadthing.com",
  // External connections: Clerk APIs, Pusher WebSocket, UploadThing API
  [
    "connect-src 'self'",
    "https://clerk.twncryr.com",
    "https://*.clerk.com",
    "https://*.clerk.accounts.dev",
    "wss://*.pusher.com",
    "https://*.pusher.com",
    "wss://*.pusherapp.com",
    "https://sockjs-eu.pusher.com",
    "https://api.uploadthing.com",
    "https://utfs.io",
  ].join(' '),
  // Clerk spawns Web Workers from blob: URLs for token polling
  "worker-src blob:",
  "font-src 'self'",
  // Clerk hosted account pages may be iframed
  "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev",
  // Block Flash/Java plugins
  "object-src 'none'",
  // Prevent base tag hijacking
  "base-uri 'self'",
  // Only allow form submissions to same origin
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
