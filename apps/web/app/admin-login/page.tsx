import { AdminLoginForm } from "../../components/admin/admin-login-form";

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const secret = process.env.ADMIN_SECRET;

  // Kalau key salah → 404
  if (!key || key !== secret) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <p className="text-sm text-[#6B6860]">404 — Halaman tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A6B5A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white">LesKas</p>
            <p className="text-xs text-white/60 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}