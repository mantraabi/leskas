"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  subject: string;
}

export function SessionForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const defaultDate = format(now, "yyyy-MM-dd");
  const defaultTime = format(now, "HH:mm");

  const [form, setForm] = useState({
    student_id: "",
    date: defaultDate,
    time: defaultTime,
    duration_minutes: "60",
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

    const scheduled_at = new Date(`${form.date}T${form.time}:00`).toISOString();

    const { error } = await supabase.from("sessions").insert({
      guru_id: user.id,
      student_id: form.student_id,
      scheduled_at,
      duration_minutes: parseInt(form.duration_minutes),
      notes: form.notes || null,
    });

    if (error) {
      setError("Gagal menyimpan. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/sessions");
    router.refresh();
  }

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Siswa <span className="text-red-500">*</span>
          </label>
          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Pilih siswa</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.subject}
              </option>
            ))}
          </select>
          {students.length === 0 && (
            <p className="text-xs text-amber-600">
              Belum ada siswa aktif.{" "}
              <Link href="/dashboard/students/new" className="underline">Tambah siswa dulu</Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1C1B19]">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1C1B19]">
              Jam <span className="text-red-500">*</span>
            </label>
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Durasi (menit)
          </label>
          <select
            name="duration_minutes"
            value={form.duration_minutes}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="60">60 menit (1 jam)</option>
            <option value="90">90 menit (1.5 jam)</option>
            <option value="120">120 menit (2 jam)</option>
            <option value="30">30 menit</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Catatan</label>
          <textarea
            name="notes"
            placeholder="Materi yang dibahas, PR, dll..."
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

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
            {loading ? "Menyimpan..." : "Simpan Sesi"}
          </button>
        </div>

      </form>
    </div>
  );
}