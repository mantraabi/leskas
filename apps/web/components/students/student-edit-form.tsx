"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const SUBJECTS = [
  "Matematika", "Fisika", "Kimia", "Biologi",
  "Bahasa Inggris", "Bahasa Indonesia", "Sejarah",
  "Geografi", "Ekonomi", "Akuntansi", "Pemrograman", "Lainnya",
];

interface Student {
  id: string;
  name: string;
  subject: string;
  grade: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  notes: string | null;
  status: "active" | "inactive";
}

export function StudentEditForm({ student }: { student: Student }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: student.name,
    subject: student.subject,
    grade: student.grade ?? "",
    parent_name: student.parent_name ?? "",
    parent_phone: student.parent_phone ?? "",
    notes: student.notes ?? "",
    status: student.status,
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
    const { error } = await supabase
      .from("students")
      .update({
        name: form.name,
        subject: form.subject,
        grade: form.grade || null,
        parent_name: form.parent_name || null,
        parent_phone: form.parent_phone || null,
        notes: form.notes || null,
        status: form.status,
      })
      .eq("id", student.id);

    if (error) {
      setError("Gagal menyimpan. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/students/${student.id}`);
    router.refresh();
  }

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Nama Siswa <span className="text-red-500">*</span></label>
          <input name="name" type="text" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Mata Pelajaran <span className="text-red-500">*</span></label>
          <select name="subject" value={form.subject} onChange={handleChange} required className={inputClass}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Kelas</label>
          <input name="grade" type="text" placeholder="Contoh: 10 SMA" value={form.grade} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Nama Orang Tua</label>
          <input name="parent_name" type="text" value={form.parent_name} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">No. WhatsApp Orang Tua</label>
          <input name="parent_phone" type="tel" value={form.parent_phone} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Catatan</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => router.back()}
            className="flex-1 h-10 rounded-lg border border-[#E4E2DC] text-sm font-semibold text-[#6B6860] hover:bg-[#F0EEE9] transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-10 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
    </div>
  );
}