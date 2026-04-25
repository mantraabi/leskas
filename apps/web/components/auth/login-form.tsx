"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8 shadow-sm">
      <h2 className="text-lg font-bold text-[#1C1B19] mb-1">
        Selamat datang kembali
      </h2>
      <p className="text-sm text-[#6B6860] mb-6">
        Masuk ke akun LesKas kamu
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Email</label>
          <input
            type="email"
            placeholder="guru@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 px-4 rounded-xl border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors placeholder:text-[#C0BEB8]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#1C1B19]">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-brand hover:underline">
              Lupa password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 px-4 rounded-xl border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors placeholder:text-[#C0BEB8]"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 mt-1 shadow-sm"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#E4E2DC]" />
        <p className="text-xs text-[#9CA3AF]">atau</p>
        <div className="flex-1 h-px bg-[#E4E2DC]" />
      </div>

      <p className="text-center text-sm text-[#6B6860]">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="text-brand font-semibold hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}