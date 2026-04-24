"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

interface Props {
  invoiceId: string;
  sisaTagihan: number;
}

const METHODS = [
  { value: "cash",     label: "Cash" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "qris",     label: "QRIS" },
  { value: "gopay",    label: "GoPay" },
  { value: "ovo",      label: "OVO" },
];

export function PaymentForm({ invoiceId, sisaTagihan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    amount: sisaTagihan.toString(),
    method: "cash",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const amount = parseFloat(form.amount);

    if (amount <= 0) {
      setError("Nominal harus lebih dari 0.");
      setLoading(false);
      return;
    }

    if (amount > sisaTagihan) {
      setError(`Nominal melebihi sisa tagihan (Rp ${sisaTagihan.toLocaleString("id-ID")}).`);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("payments").insert({
      invoice_id: invoiceId,
      amount,
      method: form.method,
    });

    if (error) {
      console.log("Supabase error:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1B19]">
          Nominal Bayar <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B6860]">
            Rp
          </span>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
            min="1000"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
        <p className="text-xs text-[#6B6860]">
          Sisa tagihan: Rp {sisaTagihan.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1B19]">
          Metode Pembayaran
        </label>
        <select
          name="method"
          value={form.method}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Catat Pembayaran"}
      </button>

    </form>
  );
}