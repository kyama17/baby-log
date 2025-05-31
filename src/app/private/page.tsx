import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthButton from '@/app/components/AuthButton'
import { User } from '@supabase/supabase-js' // Import User type

export default async function PrivatePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login?message=You must be logged in to view this page.')
    return; // Ensure redirect happens and no further code executes
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Private Page</h1>
        {/* Cast data.user to User as we've checked for its existence */}
        <AuthButton user={data.user as User} />
      </header>
      <main>
        <p>Hello, {data.user.email}! This is a private page, only for logged-in users.</p>
        <p><a href="/" style={{color: '#0070f3'}}>Go to Homepage</a></p>
      </main>
    </div>
  )
}
