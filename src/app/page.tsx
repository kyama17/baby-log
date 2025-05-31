import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import AuthButton from '@/app/components/AuthButton'
import { User } from '@supabase/supabase-js' // Import User type

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{fontSize: '2rem'}}>Welcome to the App</h1>
        {/* Cast user to User | null */}
        <AuthButton user={user as User | null} />
      </header>
      
      <section style={{marginTop: '30px', fontSize: '1.1rem'}}>
        <p>This is the public homepage. Explore our features!</p>
        {user ? (
          <>
            <p style={{marginTop: '15px'}}>You are currently logged in as {user.email}.</p>
            <p style={{marginTop: '10px'}}>
              Visit your <a href="/private" style={{color: '#0070f3', textDecoration: 'underline'}}>private page</a>.
            </p>
          </>
        ) : (
          <p style={{marginTop: '15px'}}>
            Please <a href="/login" style={{color: '#0070f3', textDecoration: 'underline'}}>log in</a> to access private content and features.
          </p>
        )}
      </section>

      <footer style={{marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#777'}}>
        <p>&copy; 2023 Your Awesome App</p>
      </footer>
    </main>
  )
}
