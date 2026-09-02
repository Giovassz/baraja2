/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos de perfil subidas a Supabase Storage (bucket "avatares").
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'njgiyjmrqkrfkhxvvjgd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
