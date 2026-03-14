import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    // Allow image optimizer to load remote images from our configured domains.
    // This is required when using <Image> with remote URLs (e.g. Cloudinary).
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; img-src 'self' data: https://res.cloudinary.com https://ik.imagekit.io https://via.placeholder.com;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['next/image'],
  },
};

export default nextConfig;
