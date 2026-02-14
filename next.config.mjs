const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dms.salasah.sa',
        pathname: '/files/**',
      },
    ],
  },
};

export default nextConfig;
