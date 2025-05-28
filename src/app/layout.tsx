import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

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
    <html lang="ja">
      <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-lg font-bold">ベビーログアプリ</h1>
            <div>
              <Link href="/" className="text-gray-300 hover:text-white">ベビーログ</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
