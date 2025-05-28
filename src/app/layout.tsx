import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Baby Log App",
  description: "Track your baby's bathroom activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-lg font-bold">Baby Log App</h1>
            <div>
              <Link href="/" className="text-gray-300 hover:text-white">Baby Log</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
