import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import AuthButton from '@/app/components/AuthButton'; // AuthButton is kept
import { cookies } from 'next/headers'; // To get cookies
import { createClient } from '@/utils/supabase/server'; // Server client
import { User } from '@supabase/supabase-js'; // User type

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ベビーログアプリ",
  description: "赤ちゃんのトイレ活動を追跡",
};

export default async function RootLayout({ // Make it async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* AuthProvider removed */}
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-lg font-bold">ベビーログアプリ</Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">ベビーログ</Link>
              {/* Pass user to AuthButton */}
              <AuthButton user={user as User | null} />
            </div>
          </div>
        </nav>
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
