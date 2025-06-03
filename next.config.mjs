import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

// The `withNextIntl` plugin can be configured with the path to your i18n configuration file.
// If your i18n setup (like `src/i18n.ts`) is correctly picked up by Next.js conventions,
// you might not need to specify the path.
// However, it's good practice to be explicit if issues arise.
// e.g., withNextIntl('./src/i18n.ts')(nextConfig)
// For now, using the default invocation.
export default withNextIntl()(nextConfig);
