'use client'; // Landing page needs to be a client component for useTranslations

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('LandingPage');

  return (
    <div>
      <h1>{t('welcomeTitle')}</h1>
      <p>{t('welcomeMessage')}</p>
      {/* Features Section */}
      <section style={{ marginBottom: '20px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>{t('featuresTitle')}</h2>
        <ul style={{ listStylePosition: 'inside' }}>
          <li style={{ marginBottom: '5px' }}>{t('feature1')}</li>
          <li style={{ marginBottom: '5px' }}>{t('feature2')}</li>
          <li style={{ marginBottom: '5px' }}>{t('feature3')}</li>
          <li style={{ marginBottom: '5px' }}>
            {t.rich('feature4', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </li>
        </ul>
      </section>
      <div>
        <Link href="/login">
          <button>{t('loginButton')}</button>
        </Link>
        {/* Add signup button/link here once signup functionality is implemented */}
      </div>
    </div>
  );
}
