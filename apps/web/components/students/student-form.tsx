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

interface Props {
  /** True kalau guru di paket Business — boleh pakai Tagihan Otomatis */
  canAutoBilling?: boolean;
}

export function StudentForm({ canAutoBilling = false }: Props) {
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
    auto_billing_enabled: false,
    billing_amount: "",
    billing_day: "1",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [target.name]: target.value }));
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

  // Validasi tagihan otomatis kalau diaktifkan
  if (canAutoBilling && form.auto_billing_enabled) {
    const amount = parseFloat(form.billing_amount);
    const day = parseInt(form.billing_day, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Nominal tagihan otomatis harus lebih dari 0.");
      setLoading(false);
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      setError("Tanggal cetak tagihan harus antara 1 dan 28.");
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
    auto_billing_enabled: canAutoBilling ? form.auto_billing_enabled : false,
    billing_amount:
      canAutoBilling && form.auto_billing_enabled
        ? parseFloat(form.billing_amount)
        : null,
    billing_day:
      canAutoBilling && form.auto_billing_enabled
        ? parseInt(form.billing_day, 10)
        : null,
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

        {/* Tagihan Otomatis (Business only) */}
        {canAutoBilling && (
          <div className="border-t border-[#E4E2DC] pt-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <input
                id="auto_billing_enabled"
                name="auto_billing_enabled"
                type="checkbox"
                checked={form.auto_billing_enabled}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-[#E4E2DC] text-brand focus:ring-brand"
              />
              <label htmlFor="auto_billing_enabled" className="flex-1 cursor-pointer">
                <p className="text-sm font-semibold text-[#1C1B19]">
                  Aktifkan Tagihan Otomatis
                </p>
                <p className="text-xs text-[#6B6860] mt-0.5">
                  Sistem akan membuat invoice otomatis tiap bulan untuk siswa ini.
                </p>
              </label>
            </div>

            {form.auto_billing_enabled && (
              <div className="grid grid-cols-2 gap-3 pl-7">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#6B6860]">
                    Nominal per bulan
                  </label>
                  <input
                    name="billing_amount"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="500000"
                    value={form.billing_amount}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#6B6860]">
                    Tanggal cetak
                  </label>
                  <select
                    name="billing_day"
                    value={form.billing_day}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Setiap tanggal {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

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