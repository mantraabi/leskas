import type { ReactNode } from "react";

/**
 * Layout publik untuk halaman Portal Orang Tua.
 * Tanpa sidebar/auth chrome — bersih, mobile-first, print-friendly.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {children}
    </div>
  );
}

export const metadata = {
  title: "Portal Orang Tua — LesKas",
  robots: { index: false, follow: false }, // jangan di-index Google
};
