'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    // Optionally redirect to an error page or handle differently
    // For now, redirect to login even if there was a signout error client-side.
    // The server session should be cleared.
  }

  return redirect('/login')
}
