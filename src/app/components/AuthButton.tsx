'use client'

import { User } from '@supabase/supabase-js'
import { logout } from '@/app/actions/authActions' // Ensure this path is correct

interface AuthButtonProps {
  user: User | null;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const handleLogout = async () => {
    await logout();
  };

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
      <a
        href="/login"
        style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: 'white', textDecoration: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Login
      </a>
    );
  }
}
