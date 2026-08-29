/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'sgp1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
      },
    ],
    qualities: [75, 100],
  },
}

export default nextConfig
