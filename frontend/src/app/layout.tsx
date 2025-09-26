import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
