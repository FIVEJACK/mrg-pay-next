import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const staticCDNUrl = process.env.S3_STATIC_CDN_URL || "";
const staticCDNPath = staticCDNUrl
  ? `${staticCDNUrl}/${process.env.S3_UPLOAD_FOLDER}`
  : "";

const nextConfig: NextConfig = {
  assetPrefix: staticCDNPath,
};

export default withNextIntl(nextConfig);
