import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LesKas — Kelola Keuangan Les Privat",
    template: "%s | LesKas",
  },
  description: "Aplikasi pengelolaan keuangan untuk guru les privat. Kelola siswa, jadwal, tagihan, dan laporan dalam satu tempat.",
  keywords: ["les privat", "keuangan guru", "tagihan siswa", "aplikasi les"],
  authors: [{ name: "LesKas" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}