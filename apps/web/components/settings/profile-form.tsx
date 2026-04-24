"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export function ProfileForm({ id, name, phone, email }: Props) {
  const [form, setForm] = useState({ name, phone });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name: form.name, phone: form.phone })
      .eq("id", id);

    if (error) {
      setError("Gagal menyimpan. Coba lagi.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1B19]">
          Nama Lengkap
        </label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1B19]">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className={`${inputClass} opacity-50 cursor-not-allowed`}
        />
        <p className="text-xs text-[#6B6860]">Email tidak bisa diubah.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1B19]">
          No. WhatsApp
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="08123456789"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
          Profil berhasil disimpan!
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}