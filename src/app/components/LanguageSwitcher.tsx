'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // The pathname returned by `usePathname` includes the current locale
    // e.g., /ja/dashboard or /en/about. We need to remove it if present.
    // If pathname is just `/` (e.g. after locale switch to default), it won't have a prefix.
    let currentPathWithoutLocale = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      currentPathWithoutLocale = pathname.substring(locale.length + 1); // +1 for the slash
    }
    
    // Ensure currentPathWithoutLocale starts with a slash if it's not empty,
    // or handle the case where it might be empty (root path).
    // If currentPathWithoutLocale became empty (e.g. was "/en"), it should become "/".
    if (currentPathWithoutLocale === '') {
      currentPathWithoutLocale = '/';
    }
    // If it doesn't start with a slash but is not empty (should not happen with above logic), prepend one.
    else if (!currentPathWithoutLocale.startsWith('/')) {
        currentPathWithoutLocale = `/${currentPathWithoutLocale}`;
    }
    
    const newPath = `/${newLocale}${currentPathWithoutLocale}`;

    router.push(newPath);
    // router.refresh() is important to ensure Server Components are re-rendered with the new locale.
    // For App Router, Next.js handles this automatically on navigation, but explicit refresh can be a fallback.
    // However, in most up-to-date next-intl versions with App Router, router.push itself should be sufficient
    // if the layout and pages correctly use next-intl hooks.
    // Let's keep it to see its effect, can be removed if it causes double loading or is unnecessary.
    router.refresh(); 
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        onClick={() => handleLanguageChange('en')}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          backgroundColor: locale === 'en' ? '#666' : 'transparent', // Darker highlight for active
          border: '1px solid #ccc',
          borderRadius: '4px',
          color: '#fff', // Assuming white text on dark nav
          opacity: locale === 'en' ? 1 : 0.7,
        }}
        disabled={locale === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ja')}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          backgroundColor: locale === 'ja' ? '#666' : 'transparent', // Darker highlight for active
          border: '1px solid #ccc',
          borderRadius: '4px',
          color: '#fff', // Assuming white text on dark nav
          opacity: locale === 'ja' ? 1 : 0.7,
        }}
        disabled={locale === 'ja'}
      >
        日本語
      </button>
    </div>
  );
}
