"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { format, addDays } from "date-fns";

interface Student {
  id: string;
  name: string;
  subject: string;
}

export function InvoiceForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultDue = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    due_date: defaultDue,
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

    const { error } = await supabase.from("invoices").insert({
      guru_id: user.id,
      student_id: form.student_id,
      amount: parseFloat(form.amount),
      due_date: form.due_date,
      notes: form.notes || null,
    });

    if (error) {
      setError("Gagal menyimpan. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/invoices");
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Nominal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B6860]">
              Rp
            </span>
            <input
              name="amount"
              type="number"
              placeholder="500000"
              value={form.amount}
              onChange={handleChange}
              required
              min="1000"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">
            Jatuh Tempo <span className="text-red-500">*</span>
          </label>
          <input
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1C1B19]">Catatan</label>
          <textarea
            name="notes"
            placeholder="Contoh: Les Matematika April 2026, 8 sesi"
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
            {loading ? "Menyimpan..." : "Buat Tagihan"}
          </button>
        </div>

      </form>
    </div>
  );
}