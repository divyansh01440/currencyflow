import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RemitFlow - Cross-Border Payments on Stellar",
  description:
    "Send money across borders instantly and affordably using the Stellar blockchain. Powered by Soroban smart contracts.",
  keywords: ["stellar", "cross-border", "payments", "remit", "blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
            RemitFlow — Built on Stellar Network. Not financial advice. For
            urgent issues, contact support@remitflow.io.
          </div>
        </footer>
      </body>
    </html>
  );
}
