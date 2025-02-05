/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // For dynamic sprite generation
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
