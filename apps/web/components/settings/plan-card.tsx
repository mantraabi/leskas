"use client";

import { useState } from "react";
import { Check, Upload, X } from "lucide-react";
import Image from "next/image";

interface Props {
  currentPlan: string;
  expiresAt: string | null;
  guruId: string;
}

const plans = [
  {
    key: "free",
    label: "Free",
    price: 0,
    features: [
      "Maks 10 siswa",
      "Tagihan manual",
      "Jadwal dasar",
    ],
  },
  {
    key: "pro",
    label: "Pro",
    price: 49000,
    features: [
      "Unlimited siswa",
      "Invoice otomatis",
      "Notifikasi WhatsApp",
      "Laporan keuangan",
      "Export PDF",
    ],
  },
  {
    key: "business",
    label: "Business",
    price: 129000,
    features: [
      "Semua fitur Pro",
      "Multi-pengajar",
      "Payment gateway",
      "WA blast ke ortu",
      "Priority support",
    ],
  },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function PlanCard({ currentPlan, expiresAt, guruId }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const qrisUrl = process.env.NEXT_PUBLIC_QRIS_URL;

  async function handleSubmit() {
    if (!file || !selectedPlan) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("plan", selectedPlan);
    formData.append("guruId", guruId);

    const response = await fetch("/api/subscription/request", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Gagal mengirim. Coba lagi.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-sm font-bold text-[#1C1B19]">Bukti pembayaran terkirim!</p>
        <p className="text-sm text-[#6B6860] mt-1">
          Admin akan memverifikasi dalam 1x24 jam. Plan kamu akan diupdate setelah dikonfirmasi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Plan list */}
      {plans.map((plan) => {
        const isActive = currentPlan === plan.key;
        const isSelected = selectedPlan === plan.key;

        return (
          <div
            key={plan.key}
            className={`rounded-xl border p-4 transition-all ${
              isActive
                ? "border-brand bg-brand/5"
                : isSelected
                ? "border-brand bg-brand/5"
                : "border-[#E4E2DC] bg-white cursor-pointer hover:border-brand/40"
            }`}
            onClick={() => {
              if (!isActive && plan.price > 0) setSelectedPlan(plan.key);
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-[#1C1B19]">{plan.label}</p>
                <p className="text-xs text-[#6B6860]">
                  {plan.price === 0
                    ? "Gratis selamanya"
                    : `${formatRupiah(plan.price)} / bulan`}
                </p>
              </div>
              {isActive && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand text-white">
                  Aktif
                </span>
              )}
              {!isActive && plan.price > 0 && (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-brand bg-brand" : "border-[#E4E2DC]"
                }`}>
                  {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                </div>
              )}
            </div>

            <ul className="flex flex-col gap-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#6B6860]">
                  <Check size={12} className="text-brand flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Flow bayar QRIS */}
      {selectedPlan && (
        <div className="border border-brand/20 bg-brand/5 rounded-xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold text-[#1C1B19] mb-1">
              Bayar via QRIS
            </p>
            <p className="text-xs text-[#6B6860]">
              Scan QRIS di bawah, transfer{" "}
              <span className="font-bold text-brand">
                {formatRupiah(plans.find((p) => p.key === selectedPlan)?.price ?? 0)}
              </span>
              , lalu upload bukti pembayaran.
            </p>
          </div>

          {/* QRIS Image */}
          {qrisUrl ? (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-3 border border-[#E4E2DC] inline-block">
                <img
                  src={qrisUrl}
                  alt="QRIS LesKas"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-dashed border-[#E4E2DC] text-center">
              <p className="text-xs text-[#9CA3AF]">QRIS belum dikonfigurasi</p>
            </div>
          )}

          {/* Upload bukti */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1C1B19]">
              Upload Bukti Pembayaran
            </label>
            {file ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-brand/30 bg-white">
                <Check size={14} className="text-brand flex-shrink-0" />
                <p className="text-xs text-[#1C1B19] flex-1 truncate">{file.name}</p>
                <button onClick={() => setFile(null)}>
                  <X size={14} className="text-[#9CA3AF]" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-[#E4E2DC] bg-white cursor-pointer hover:border-brand/40 transition-colors">
                <Upload size={14} className="text-[#9CA3AF]" />
                <span className="text-sm text-[#9CA3AF]">Pilih foto/screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedPlan(null); setFile(null); }}
              className="flex-1 h-10 rounded-xl border border-[#E4E2DC] text-sm font-semibold text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="flex-1 h-10 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim Bukti Bayar"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}