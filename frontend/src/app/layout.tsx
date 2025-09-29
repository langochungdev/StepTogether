import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import CursorEffects from "../components/CursorEffects";

export const metadata: Metadata = {
  title: "StepTogether",
  description: "Trang web hỗ trợ theo dõi tiến trình nhóm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-900 text-white">
        <Script
          src="https://unpkg.com/cursor-effects@latest/dist/browser.js"
          strategy="afterInteractive"
        />
        <CursorEffects />
        <main>{children}</main>
      </body>
    </html>
  );
}
