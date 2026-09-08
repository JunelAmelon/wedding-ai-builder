/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // 👈 Ajoute cette ligne pour tester
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/admin/login",
        destination: "/admin-login",
        permanent: false,
      },
      {
        source: "/admin/register",
        destination: "/admin-register",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
