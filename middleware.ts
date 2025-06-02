import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server' // Assuming server client can be created here

export async function middleware(request: NextRequest) {
  // First, refresh the session
  const response = await updateSession(request)

  // Create a Supabase client to get the user
  // Note: This might need to use request/response from updateSession if they are modified
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If the user is not authenticated and trying to access /dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    // Redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access /login or / (landing)
  //
  // This part is commented out as it was not explicitly requested.
  // Depending on UX, you might want to redirect logged-in users away from public pages.
  // if (user && (pathname === '/login' || pathname === '/')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/dashboard'
  //   return NextResponse.redirect(url)
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}