import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "VaultPass",
  description: "Password Generator + Secure Vault"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <Header />
          <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}


