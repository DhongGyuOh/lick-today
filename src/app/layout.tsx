import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lick Today | 매일 5개의 기타 릭",
  description: "AI가 매일 생성하는 기타 릭 5개와 이론 설명, 탭악보, 재생을 한 곳에서.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6387613955151148"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <header className="border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🎸 Lick Today
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-400">
              <Link href="/" className="hover:text-white transition-colors">
                오늘의 릭
              </Link>
              <Link
                href="/archive"
                className="hover:text-white transition-colors"
              >
                아카이브
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
          매일 AI가 생성한 기타 릭 5개를 공유합니다.
        </footer>
        <SpeedInsights />
      </body>
    </html>
  );
}