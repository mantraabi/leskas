"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { format, addMonths } from "date-fns";
import { id } from "date-fns/locale";

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
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleUpgrade(planKey: string, price: number) {
    setLoading(planKey);
    setError("");

    const response = await fetch("/api/subscription/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey, amount: price }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Gagal membuat pembayaran.");
      setLoading(null);
      return;
    }

    window.location.href = data.paymentUrl;
  }

  return (
    <div className="flex flex-col gap-4">

      {expiresAt && currentPlan !== "free" && (
        <p className="text-xs text-[#6B6860] bg-[#F0EEE9] rounded-lg px-3 py-2">
          Plan aktif hingga{" "}
          <span className="font-semibold text-[#1C1B19]">
            {format(new Date(expiresAt), "d MMMM yyyy", { locale: id })}
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-3">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.key;
          const isDowngrade =
            (currentPlan === "business" && plan.key !== "business") ||
            (currentPlan === "pro" && plan.key === "free");

          return (
            <div
              key={plan.key}
              className={`rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-brand bg-brand/5"
                  : "border-[#E4E2DC] bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#1C1B19]">
                    {plan.label}
                  </p>
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
              </div>

              <ul className="flex flex-col gap-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#6B6860]">
                    <Check size={12} className="text-brand flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isActive && !isDowngrade && plan.price > 0 && (
                <button
                  onClick={() => handleUpgrade(plan.key, plan.price)}
                  disabled={loading === plan.key}
                  className="w-full h-9 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
                >
                  {loading === plan.key ? "Memproses..." : `Upgrade ke ${plan.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}