import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "備品リース契約管理",
  description: "会社備品のリース契約を一元管理するシステム",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        {session && <Navigation />}
        <main className={session ? "ml-64 p-8" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
