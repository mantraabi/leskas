"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { LogOut } from "lucide-react";

interface Props {
  name: string;
  plan: string;
}

export function MobileHeader({ name, plan }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header
      className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#E4E2DC] flex items-center gap-3 px-4 py-2.5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.625rem)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-[#1C1B19]">LesKas</p>
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-semibold text-[#1C1B19] leading-tight max-w-[100px] truncate">
            {name}
          </p>
          <p className="text-[10px] text-brand font-medium capitalize leading-none">
            {plan} Plan
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[#9CA3AF] hover:text-red-500 transition-colors p-1"
          title="Keluar"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
