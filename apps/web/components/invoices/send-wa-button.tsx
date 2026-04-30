"use client";

import { useState } from "react";
import { MessageCircle, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  invoiceId: string;
  phone: string;
  namaOrtu: string;
  namaSiswa: string;
  nominal: number;
  jatuhTempo: string;
  status: string;
  /** kalau true, tampilkan locked state karena user di paket Free */
  locked?: boolean;
}

export function SendWAButton({
  invoiceId,
  phone,
  namaOrtu,
  namaSiswa,
  nominal,
  jatuhTempo,
  status,
  locked = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!phone) {
      setError("Nomor WA ortu belum diisi di data siswa.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/send-wa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        phone,
        namaOrtu,
        namaSiswa,
        nominal,
        jatuhTempo,
        type: status === "overdue" ? "overdue" : "reminder",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Gagal mengirim. Coba lagi.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (locked) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-[#F0EEE9] text-[#9CA3AF] text-sm font-semibold cursor-not-allowed"
        >
          <Lock size={14} />
          Kirim Tagihan via WhatsApp
        </button>
        <p className="text-xs text-[#6B6860]">
          Notifikasi WhatsApp tersedia di paket Pro.{" "}
          <Link
            href="/dashboard/settings"
            className="text-brand font-semibold hover:underline"
          >
            Upgrade →
          </Link>
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
        <MessageCircle size={15} />
        Pesan terkirim ke WA!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleSend}
        disabled={loading || !phone}
        className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors disabled:opacity-60"
      >
        <MessageCircle size={15} />
        {loading ? "Mengirim..." : "Kirim Tagihan via WhatsApp"}
      </button>
      {!phone && (
        <p className="text-xs text-amber-600">
          Nomor WA ortu belum diisi.{" "}
          <a href="#" className="underline">Edit data siswa</a>
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}