import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthButton from '@/app/components/AuthButton';
import LanguageSwitcher from '@/app/components/LanguageSwitcher'; // Import LanguageSwitcher
import { NextIntlClientProvider, useMessages, useTranslations } from 'next-intl'; // Add useTranslations
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation'; // Import notFound
import { getTranslations } from 'next-intl/server'; // For server components metadata

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = { // Old static metadata
//   title: "ベビーログアプリ",
//   description: "赤ちゃんのトイレ活動を追跡",
// };

export async function generateMetadata({params: {locale}} : {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Layout'});
  return {
    title: t('title'),
    description: t('description')
  };
}

export default function RootLayout({
  children,
  params, // Destructure params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string }; // Add locale to params
}>) {
  const locale = useLocale();

  // Validate that the incoming `locale` parameter is valid
  if (params.locale !== locale) {
    notFound();
  }

  const messages = useMessages();
  const t = useTranslations('Layout'); // Initialize t for Layout

  return (
    <html lang={locale} className="mdl-js"> {/* Set lang dynamically */}
      <body className={inter.className}>
        {/* Pass locale and messages to the provider */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <nav className="bg-gray-800 p-4">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white text-lg font-bold">{t('appName')}</Link>
                <div className="flex items-center space-x-4">
                  <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">{t('babyLogLink')}</Link>
                  <AuthButton />
                  <LanguageSwitcher /> {/* Add LanguageSwitcher here */}
                </div>
              </div>
            </nav>
            <main className="p-4">
              {children}
            </main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
