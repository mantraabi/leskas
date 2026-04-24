import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LesKas — Kelola Keuangan Les Privat",
  description: "Aplikasi pengelolaan keuangan untuk guru les privat.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}