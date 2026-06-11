/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // SDK story was promoted to the home page
      { source: "/sdk", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
