import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { message?: string }
}) {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <form>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login / Sign Up</h1>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input id="email" name="email" type="email" required
                 style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input id="password" name="password" type="password" required
                 style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
        </div>
        <button
          formAction={login}
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
        >
          Log in
        </button>
        <button
          formAction={signup}
          style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign up
        </button>
        {searchParams?.message && (
          <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>
            {searchParams.message}
          </p>
        )}
      </form>
      {/*
        Note: To prevent logged-in users from accessing the login page,
        you can add a check at the beginning of this Server Component:

        import { cookies } from 'next/headers'
        import { createClient } from '@/utils/supabase/server'
        import { redirect } from 'next/navigation'

        export default async function LoginPage(...) {
          const cookieStore = cookies()
          const supabase = createClient(cookieStore)
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            redirect('/')
          }
          ...
        }
        This is a common pattern when not relying solely on middleware for this.
      */}
    </div>
  )
}
