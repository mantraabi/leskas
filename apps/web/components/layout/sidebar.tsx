"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Siswa", href: "/dashboard/students", icon: Users },
  { label: "Tagihan", href: "/dashboard/invoices", icon: FileText },
  { label: "Jadwal", href: "/dashboard/sessions", icon: Calendar },
  { label: "Laporan", href: "/dashboard/reports", icon: BarChart2 },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  name: string;
  plan: string;
}

export function Sidebar({ name, plan }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-[200px] bg-white border-r border-[#E4E2DC] flex flex-col flex-shrink-0 h-full">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#E4E2DC]">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1C1B19] tracking-tight leading-none">
            LesKas
          </p>
          <p className="text-[10px] text-[#9CA3AF] font-medium tracking-wider uppercase mt-0.5">
            Les Privat
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all ${
                active
                  ? "bg-brand/10 text-brand"
                  : "text-[#6B6860] hover:bg-[#F0EEE9] hover:text-[#1C1B19]"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t border-[#E4E2DC]">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#F0EEE9]">
          <div className="w-7 h-7 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1C1B19] truncate">{name}</p>
            <p className="text-[10px] text-brand font-medium capitalize">{plan} Plan</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#9CA3AF] hover:text-red-500 transition-colors"
            title="Keluar"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

    </aside>
  );
}