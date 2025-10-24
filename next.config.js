/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},   // optional, silences warnings
  webpack: (config) => config, // keep this for build fallback
};

module.exports = nextConfig;
