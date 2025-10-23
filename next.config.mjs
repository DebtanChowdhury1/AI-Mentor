/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,     // keep this if you installed babel-plugin-react-compiler
    serverActions: {},       // must be an object (empty is fine)
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
