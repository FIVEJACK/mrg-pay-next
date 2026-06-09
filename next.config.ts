import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const staticCDNUrl = process.env.S3_STATIC_CDN_URL || "";
const staticCDNPath = staticCDNUrl
  ? `${staticCDNUrl}/${process.env.S3_UPLOAD_FOLDER}`
  : "";

const isDev = process.env.NODE_ENV !== "production";
const pubnubFileHost =
  "https://pubnub-mnemosyne-files-us-east-1-prd.s3.dualstack.us-east-1.amazonaws.com";

const cspDirectives: Record<string, Array<string | false>> = {
  "default-src": ["'self'", staticCDNUrl],
  "script-src": ["'self'", "'unsafe-inline'", isDev && "'unsafe-eval'", staticCDNUrl],
  "style-src": ["'self'", "'unsafe-inline'", staticCDNUrl],
  "font-src": ["'self'", "data:", staticCDNUrl],
  "img-src": ["'self'", "data:", "blob:", "https:", pubnubFileHost],
  "connect-src": [
    "'self'",
    "https://*.pubnub.com",
    "https://*.pndsn.com",
    "wss://*.pubnub.com",
    "wss://*.pndsn.com",
    pubnubFileHost,
    isDev && "ws:",
  ],
  "frame-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
};

const csp = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.filter(Boolean).join(" ")}`)
  .join("; ");

const nextConfig: NextConfig = {
  assetPrefix: staticCDNPath,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
