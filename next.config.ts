import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { IMAGE_HOSTS } from "./src/lib/image-hosts";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const staticCDNUrl = process.env.S3_STATIC_CDN_URL || "";
const staticCDNPath = staticCDNUrl
  ? `${staticCDNUrl}/${process.env.S3_UPLOAD_FOLDER}`
  : "";

const isDev = process.env.NODE_ENV !== "production";

const cspDirectives: Record<string, Array<string | false>> = {
  "default-src": ["'self'", staticCDNUrl],
  "script-src": ["'self'", "'unsafe-inline'", isDev && "'unsafe-eval'", staticCDNUrl],
  "style-src": ["'self'", "'unsafe-inline'", staticCDNUrl],
  "font-src": ["'self'", "data:", staticCDNUrl],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "connect-src": [
    "'self'",
    "https://*.pubnub.com",
    "https://*.pndsn.com",
    "wss://*.pubnub.com",
    "wss://*.pndsn.com",
    isDev && "ws:",
  ],
  "frame-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
};

const csp = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.filter(Boolean).join(" ")}`)
  .join("; ");

const imagePatterns = [...IMAGE_HOSTS, "**.pndsn.com"].map((hostname) => ({
  protocol: "https" as const,
  hostname,
}));

const nextConfig: NextConfig = {
  assetPrefix: staticCDNPath,
  images: {
    path: process.env.IMAGE_LOADER || undefined,
    remotePatterns: imagePatterns,
    deviceSizes: [240, 320, 360, 375, 390, 414, 428, 600, 800, 1000, 1033],
    imageSizes: [24, 32, 48, 64, 96, 140, 148],
  },
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
