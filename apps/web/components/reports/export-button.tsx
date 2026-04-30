"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportToExcel, exportToPDF, type LaporanRow } from "@/lib/export";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Invoice {
  id: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  students: { name: string } | null;
}

interface Props {
  invoices: Invoice[];
}

const statusLabels: Record<string, string> = {
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  paid: "Lunas",
  overdue: "Terlambat",
};

export function ExportButton({ invoices }: Props) {
  const [open, setOpen] = useState(false);

  const filename = `LesKas-Laporan-${format(new Date(), "yyyy-MM")}`;
  const title = `Laporan Tagihan — ${format(new Date(), "MMMM yyyy", { locale: id })}`;

  const data: LaporanRow[] = invoices.map((inv) => ({
    siswa: inv.students?.name ?? "Siswa",
    jumlah: inv.amount,
    dibayar: inv.amount_paid,
    sisa: inv.amount - inv.amount_paid,
    status: statusLabels[inv.status] ?? inv.status,
    jatuhTempo: format(new Date(inv.due_date), "d MMM yyyy", { locale: id }),
  }));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E4E2DC] bg-white text-sm font-semibold text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
      >
        <Download size={14} />
        Export
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-10 z-20 bg-white border border-[#E4E2DC] rounded-xl shadow-lg overflow-hidden w-40">
            <button
              onClick={() => {
                exportToExcel(data, filename);
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-left text-[#1C1B19] hover:bg-[#F0EEE9] transition-colors flex items-center gap-2"
            >
              <span>📊</span> Excel (.xlsx)
            </button>
            <button
              onClick={() => {
                exportToPDF(data, filename, title);
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-sm text-left text-[#1C1B19] hover:bg-[#F0EEE9] transition-colors flex items-center gap-2 border-t border-[#E4E2DC]"
            >
              <span>📄</span> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}