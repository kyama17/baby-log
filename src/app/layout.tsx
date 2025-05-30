import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthButton from '@/app/components/AuthButton'; // Corrected Import AuthButton

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ベビーログアプリ",
  description: "赤ちゃんのトイレ活動を追跡",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja"> {/* Ensure lang is 'ja' */}
      <body className={inter.className}>
        <AuthProvider>
          <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-white text-lg font-bold">ベビーログアプリ</Link>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">ベビーログ</Link>
                <AuthButton /> {/* Add AuthButton here */}
              </div>
            </div>
          </nav>
          <main className="p-4"> {/* Added main tag with padding for content separation */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
