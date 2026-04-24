"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Invoice {
  id: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: "unpaid" | "partial" | "paid" | "overdue";
  created_at: string;
  students: { name: string; parent_phone: string | null } | null;
}

const statusConfig = {
  unpaid:  { label: "Belum Bayar", class: "bg-amber-50 text-amber-700" },
  partial: { label: "Sebagian",    class: "bg-blue-50 text-blue-700" },
  paid:    { label: "Lunas",       class: "bg-green-50 text-green-700" },
  overdue: { label: "Terlambat",   class: "bg-red-50 text-red-600" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid" | "overdue">("all");

  const filtered = invoices.filter(
    (inv) => filter === "all" || inv.status === filter
  );

  // Hitung total belum dibayar
  const totalUnpaid = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .reduce((sum, inv) => sum + (inv.amount - inv.amount_paid), 0);

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] py-16 text-center">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-sm font-semibold text-[#1C1B19]">Belum ada tagihan</p>
        <p className="text-sm text-[#6B6860] mt-1">Buat tagihan pertama kamu</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Summary */}
      {totalUnpaid > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-700">Total belum dibayar</p>
          <p className="text-sm font-bold text-amber-700 font-mono">
            {formatRupiah(totalUnpaid)}
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex rounded-lg border border-[#E4E2DC] overflow-hidden bg-white w-fit">
        {(["all", "unpaid", "paid", "overdue"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-brand text-white"
                : "text-[#6B6860] hover:bg-[#F0EEE9]"
            }`}
          >
            {f === "all" ? "Semua" : statusConfig[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#6B6860] py-10">
            Tidak ada tagihan dengan status ini.
          </p>
        ) : (
          <div className="divide-y divide-[#E4E2DC]">
            {filtered.map((inv) => (
              <Link
                key={inv.id}
                href={`/dashboard/invoices/${inv.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F5F4F0] transition-colors"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1B19]">
                    {inv.students?.name ?? "Siswa"}
                  </p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    Jatuh tempo:{" "}
                    {format(new Date(inv.due_date), "d MMM yyyy", { locale: id })}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-[#1C1B19]">
                    {formatRupiah(inv.amount)}
                  </p>
                  {inv.amount_paid > 0 && inv.status !== "paid" && (
                    <p className="text-xs text-[#6B6860]">
                      Dibayar: {formatRupiah(inv.amount_paid)}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusConfig[inv.status].class}`}>
                  {statusConfig[inv.status].label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}