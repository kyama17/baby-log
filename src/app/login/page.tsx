'use client'; // Required for hooks and event handlers

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext'; // Using alias

export default function LoginPage() {
  const { user, signIn, signUp, loading } = useAuthContext();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between sign-in and sign-up
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp({ email, password });
        if (signUpError) {
          // Check if the error is due to email confirmation
          if (signUpError.message.includes('Email confirmation')) {
             setError('Sign up successful! Please check your email to confirm your account.');
             // Optionally, you might not want to redirect immediately here,
             // or redirect to a page that says "please confirm your email".
             // For now, we'll clear the form and let the user know.
             setEmail('');
             setPassword('');
             // router.push('/'); // Or a specific page for email confirmation
          } else {
            throw signUpError;
          }
        } else {
          // Successful sign up, but typically Supabase sends a confirmation email.
          // User might not be immediately available until confirmed.
          // For now, let's assume auto-confirmation or redirect and let onAuthStateChange handle it.
          router.push('/');
        }
      } else {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) throw signInError;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  // Display loading message if auth state is loading or if user is defined (will redirect)
  if (loading || user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isSignUp ? 'Create an Account' : 'Sign In'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button 
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button 
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null); // Clear error when switching forms
        }}
        style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: 'transparent', color: '#0070f3', border: '1px solid #0070f3', borderRadius: '4px', cursor: 'pointer' }}
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
      {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}
