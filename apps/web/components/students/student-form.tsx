"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { getLimits } from "../../lib/plan";

const SUBJECTS = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Inggris",
  "Bahasa Indonesia",
  "Sejarah",
  "Geografi",
  "Ekonomi",
  "Akuntansi",
  "Pemrograman",
  "Lainnya",
];

export function StudentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    subject: "",
    grade: "",
    parent_name: "",
    parent_phone: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    router.push("/auth/login");
    return;
  }

  // Cek limit sesuai plan efektif (auto-downgrade kalau expired)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);
  if (Number.isFinite(limits.maxStudents)) {
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("guru_id", user.id)
      .eq("status", "active");

    if ((count ?? 0) >= limits.maxStudents) {
      setError(
        `Batas maksimal ${limits.maxStudents} siswa aktif untuk paket kamu. Upgrade ke Pro untuk unlimited siswa.`
      );
      setLoading(false);
      return;
    }
  }

  const { error } = await supabase.from("students").insert({
    guru_id: user.id,
    name: form.name,
    subject: form.subject,
    grade: form.grade || null,
    parent_name: form.parent_name || null,
    parent_phone: form.parent_phone || null,
    notes: form.notes || null,
  });

  if (error) {
    setError("Gagal menyimpan. Coba lagi.");
    setLoading(false);
    return;
  }

  router.push("/dashboard/students");
  router.refresh();
}

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Nama Siswa */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Nama Siswa <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="Contoh: Budi Santoso"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Mata Pelajaran */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Mata Pelajaran <span className="text-red-500">*</span>
          </label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Pilih mata pelajaran</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Kelas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Kelas
          </label>
          <input
            name="grade"
            type="text"
            placeholder="Contoh: 10 SMA, 8 SMP, 6 SD"
            value={form.grade}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Nama Orang Tua */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Nama Orang Tua
          </label>
          <input
            name="parent_name"
            type="text"
            placeholder="Contoh: Pak Hendra"
            value={form.parent_name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* No WA Orang Tua */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            No. WhatsApp Orang Tua
          </label>
          <input
            name="parent_phone"
            type="tel"
            placeholder="Contoh: 08123456789"
            value={form.parent_phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Catatan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Catatan
          </label>
          <textarea
            name="notes"
            placeholder="Catatan khusus tentang siswa ini..."
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-10 rounded-lg border border-[#E4E2DC] text-sm font-semibold text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Siswa"}
          </button>
        </div>

      </form>
    </div>
  );
}