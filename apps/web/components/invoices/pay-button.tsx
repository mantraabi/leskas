"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

interface Props {
  invoiceId: string;
}

export function PayButton({ invoiceId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Gagal membuat link pembayaran.");
      setLoading(false);
      return;
    }

    // Redirect ke halaman pembayaran Duitku
    window.location.href = data.paymentUrl;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handlePay}
        disabled={loading}
        className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        <CreditCard size={15} />
        {loading ? "Memproses..." : "Bayar via Link (QRIS / Transfer / e-Wallet)"}
      </button>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}