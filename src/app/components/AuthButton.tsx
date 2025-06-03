'use client';

import { useAuthContext } from '@/contexts/AuthContext'; // Using alias
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations

export default function AuthButton() {
  const { user, signOut, loading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('AuthButton'); // Initialize t for AuthButton

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      // Optionally show an error to the user via a toast or state update
    } else {
      // After logout, the user might be redirected by middleware or other logic.
      // If `next-intl` is setup with locale prefixes, router.push('/login') might need to be locale-aware.
      // However, AuthButton is a shared component. The target path '/login' will be
      // automatically prefixed by the middleware if accessed directly.
      // For programmatic navigation, ensure the path is correct or use locale-prefixed paths.
      // For now, assuming '/login' will be handled correctly by the router and middleware.
      router.push('/login'); 
    }
  };

  if (loading) {
    return (
      <button 
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'default', color: '#555' }} 
        disabled
      >
        {t('loading')}
      </button>
    );
  }

  if (user) {
    // The user email is not translated as it's dynamic content.
    // The color #333 might not be ideal for a dark theme (e.g. bg-gray-800 navbar).
    // Consider making styles more theme-aware or passing them as props if this component is reused in different themes.
    // For now, keeping existing styles.
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '12px', color: '#fff' }}>{user.email}</span> {/* Changed color to #fff for better visibility on dark nav */}
        <button
          onClick={handleLogout}
          style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {t('logout')}
        </button>
      </div>
    );
  } else {
    return (
      <button
        onClick={() => router.push('/login')} // Same routing consideration as in handleLogout
        style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {t('login')}
      </button>
    );
  }
}
