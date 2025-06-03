import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createClient } from '@/utils/supabase/server';
import createIntlMiddleware from 'next-intl/middleware';

// Configure next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'ja',
  localeDetection: true, // Default, attempts to detect locale from headers, etc.
});

export async function middleware(request: NextRequest) {
  // 1. Handle internationalization.
  // This may redirect (e.g., to add a missing locale prefix) or rewrite the URL.
  const i18nResult = intlMiddleware(request);

  // If intlMiddleware returns a response with a location header, it's a redirect.
  if (i18nResult && i18nResult.headers?.has('location')) {
    return i18nResult;
  }

  // If no redirect, `request` might have its `nextUrl` rewritten by `intlMiddleware`.
  // Now, proceed with Supabase session handling.
  // `updateSession` needs the original `request` object (potentially with `nextUrl` modified by intl).
  // It will return a `NextResponse`, which might include set-cookie headers for the session.
  const sessionResponse = await updateSession(request);

  // 3. Perform authentication checks using the user from the (updated) session.
  // Create a Supabase client. It will use cookies set/updated by `updateSession`.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use the pathname from the request's URL. This URL has been processed by `intlMiddleware`
  // and will be locale-aware (e.g., /en/dashboard or /ja/dashboard).
  const { pathname, locale } = request.nextUrl; // `locale` is added by `next-intl`

  // If the user is not authenticated and trying to access a protected route.
  // Ensure paths are checked *after* locale processing.
  // Example: /en/dashboard or /ja/dashboard
  if (!user && pathname.startsWith(`/${locale}/dashboard`)) {
    const loginUrl = request.nextUrl.clone();
    // Redirect to the locale-specific login page.
    loginUrl.pathname = `/${locale}/login`;
    // Clear search params to avoid carrying them over to login, or handle them explicitly if needed.
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // Optional: Redirect authenticated users from public pages like login to their dashboard.
  // if (user && pathname.startsWith(`/${locale}/login`)) {
  //   const dashboardUrl = request.nextUrl.clone();
  //   dashboardUrl.pathname = `/${locale}/dashboard`;
  //   dashboardUrl.search = '';
  //   return NextResponse.redirect(dashboardUrl);
  // }

  // Return the response from `updateSession`. This contains any session cookies.
  // It could also be a redirect response if `updateSession` itself decided to redirect.
  return sessionResponse;
}

export const config = {
  // Matcher for `next-intl` to handle locale prefixes and the root path.
  // This ensures the middleware runs for:
  // - The root '/' (to redirect to e.g., '/ja' or '/en' based on `defaultLocale` and `localeDetection`)
  // - Paths starting with '/en' or '/ja' (e.g., /en/about, /ja/profile)
  // It avoids running on:
  // - API routes (typically /api/...)
  // - Next.js internal paths (_next/*)
  // - Static files in `public` folder if they have extensions (e.g. favicon.ico, image.png)
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // The above is a common catch-all from next-intl examples.
    // Alternatively, be more specific if needed:
    // '/', // Match root for locale detection/redirection
    // '/(ja|en)/:path*', // Match locale-prefixed paths
    // Ensure this doesn't conflict with Supabase's original matcher for static assets if any issues arise.
    // The Supabase matcher was: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    // The `.*\\..*` in the next-intl matcher already covers most asset types like `favicon.ico`.
  ]
};