import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', textAlign: 'center', backgroundColor: '#f0f8ff' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5em', color: '#333' }}>Welcome to Baby Logger!</h1>
        <p style={{ fontSize: '1.2em', color: '#555' }}>
          Easily track your baby's feeding, sleeping, and diaper changes. Get valuable insights and make parenting a little simpler.
        </p>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2em', color: '#333', marginBottom: '20px' }}>Key Features & Benefits</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', margin: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
            <h3 style={{ fontSize: '1.5em', color: '#007bff' }}>Comprehensive Tracking</h3>
            <p style={{ color: '#666' }}>Log diaper changes (pee and poop), feeding times, and sleep patterns with just a few clicks.</p>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', margin: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
            <h3 style={{ fontSize: '1.5em', color: '#28a745' }}>Insightful Overviews</h3>
            <p style={{ color: '#666' }}>View historical logs and charts to understand your baby's routines and spot trends.</p>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', margin: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
            <h3 style={{ fontSize: '1.5em', color: '#ffc107' }}>Secure & Private</h3>
            <p style={{ color: '#666' }}>Your data is safe with our secure user authentication (powered by Supabase), ensuring only you can access your baby's information.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8em', color: '#333', marginBottom: '15px' }}>Get Started Today!</h2>
        <p style={{ fontSize: '1.1em', color: '#555', marginBottom: '25px' }}>
          Create an account to start logging and managing your baby's activities, or log in if you already have an account.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link href="/login">
            <button style={{ padding: '10px 20px', fontSize: '1.1em', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Log In
            </button>
          </Link>
          <Link href="/login">
            <button style={{ padding: '10px 20px', fontSize: '1.1em', color: 'white', backgroundColor: '#28a745', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Sign Up
            </button>
          </Link>
        </div>
      </section>

      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <p style={{ color: '#777' }}>Baby Logger - Making your parenting journey smoother.</p>
      </footer>
    </div>
  );
}
