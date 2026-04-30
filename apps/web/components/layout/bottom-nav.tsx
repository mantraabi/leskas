"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart2,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Beranda",    href: "/dashboard",          icon: LayoutDashboard },
  { label: "Siswa",      href: "/dashboard/students", icon: Users },
  { label: "Tagihan",    href: "/dashboard/invoices", icon: FileText },
  { label: "Jadwal",     href: "/dashboard/sessions", icon: Calendar },
  { label: "Laporan",    href: "/dashboard/reports",  icon: BarChart2 },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E4E2DC] flex justify-around items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        // /dashboard cocok exact, item lain pakai prefix supaya sub-route tetap aktif
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
              active ? "text-brand" : "text-[#6B6860] hover:text-[#1C1B19]"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.4 : 2} />
            <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
