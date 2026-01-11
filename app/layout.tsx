import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blogger CMS | Galactis.ai",
  description: "Content Management System for Galactis.ai Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

