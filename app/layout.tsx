import type { Metadata } from "next";
import { SiteFooter } from "@/components/shared/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rayo Challenge",
  description:
    "A content portal for athlete and club uploads, account tracking, and community momentum.",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#050505] text-white">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
