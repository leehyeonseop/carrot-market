/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    taint: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "imagedelivery.net",
      },
    ],
  },
};

export default nextConfig;
