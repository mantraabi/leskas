"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8 shadow-sm">
      <h2 className="text-xl font-bold text-[#1C1B19] mb-1">
        Buat akun gratis
      </h2>
      <p className="text-sm text-[#6B6860] mb-6">
        Mulai kelola keuangan les kamu hari ini
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Bu Rahma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Email
          </label>
          <input
            type="email"
            placeholder="guru@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Password
          </label>
          <input
            type="password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-10 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 mt-1"
        >
          {loading ? "Mendaftar..." : "Daftar Sekarang — Gratis"}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6860] mt-5">
        Sudah punya akun?{" "}
        <Link
          href="/auth/login"
          className="text-brand font-semibold hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}