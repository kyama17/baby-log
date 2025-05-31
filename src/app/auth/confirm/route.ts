import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server' // Adjusted path assuming @ is src
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/' // Default redirect path after confirmation

  // If token_hash or type is missing, redirect to an error page immediately.
  if (!token_hash || !type) {
    const errorMessage = encodeURIComponent('Missing token or type parameters.');
    return redirect(`/error?message=${errorMessage}`);
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (!error) {
    // On successful OTP verification, Supabase sets the session cookies.
    // Redirecting to 'next' (e.g., dashboard, homepage)
    return redirect(next)
  }

  // If OTP verification fails, redirect to an error page with a message.
  console.error('Auth confirmation error:', error.message); // Log the error server-side
  const errorMessage = encodeURIComponent('Failed to verify email: ' + error.message);
  return redirect(`/error?message=${errorMessage}`)
}
