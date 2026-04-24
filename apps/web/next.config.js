/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@leskas/ui", "@leskas/types", "@leskas/utils"],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
