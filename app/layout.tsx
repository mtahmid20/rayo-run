import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rayo Challenge",
  description:
    "A daily fitness challenge app for check-ins, photo proof, streak tracking, and athlete momentum.",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#050505] text-white">{children}</body>
    </html>
  );
}
