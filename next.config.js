/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Supabase Storage public URLs — restrict to the configured project host
    // in production via NEXT_PUBLIC_SUPABASE_URL if you want to lock this down.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
