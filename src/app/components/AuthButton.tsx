'use client';

import { useAuthContext } from '@/contexts/AuthContext'; // Using alias
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const { user, signOut, loading } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      // Optionally show an error to the user via a toast or state update
    } else {
      router.push('/login'); // Redirect to login page after logout
    }
  };

  if (loading) {
    return <button style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'default', color: '#555' }} disabled>...</button>;
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '12px', color: '#333' }}>{user.email}</span>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    );
  } else {
    return (
      <button 
        onClick={() => router.push('/login')}
        style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Login
      </button>
    );
  }
}
