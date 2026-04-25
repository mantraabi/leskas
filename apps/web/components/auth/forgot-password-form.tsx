"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("Gagal mengirim email. Coba lagi.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8 shadow-sm text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-bold text-[#1C1B19] mb-2">
          Email terkirim!
        </h2>
        <p className="text-sm text-[#6B6860] mb-6">
          Cek inbox <span className="font-semibold text-[#1C1B19]">{email}</span> dan klik link untuk reset password kamu.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-brand font-semibold hover:underline"
        >
          <ArrowLeft size={14} />
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E4E2DC] p-8 shadow-sm">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali
      </Link>

      <h2 className="text-lg font-bold text-[#1C1B19] mb-1">
        Lupa password?
      </h2>
      <p className="text-sm text-[#6B6860] mb-6">
        Masukkan email kamu dan kami akan kirim link untuk reset password.
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
          className="h-11 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 shadow-sm"
        >
          {loading ? "Mengirim..." : "Kirim Link Reset Password"}
        </button>
      </form>
    </div>
  );
}