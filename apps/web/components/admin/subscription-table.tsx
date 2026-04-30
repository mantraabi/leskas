"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  amount: number;
  status: string;
  proof_url: string | null;
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  profiles: { name: string; phone: string | null } | null;
  guru_id: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pending:   { label: "Menunggu", class: "bg-amber-50 text-amber-700" },
  active:    { label: "Aktif",    class: "bg-green-50 text-green-700" },
  rejected:  { label: "Ditolak", class: "bg-red-50 text-red-600" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function SubscriptionTable({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [list, setList] = useState(subscriptions);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAction(
    subId: string,
    guruId: string,
    plan: string,
    expiresAt: string,
    action: "approve" | "reject"
  ) {
    setLoadingId(subId);
    setActionError(null);

    const response = await fetch("/api/admin/subscription-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subId, guruId, plan, expiresAt, action }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setList((prev) =>
        prev.map((s) =>
          s.id === subId
            ? { ...s, status: action === "approve" ? "active" : "rejected" }
            : s
        )
      );
    } else {
      setActionError(data.error ?? `Gagal ${action}. Coba lagi.`);
    }

    setLoadingId(null);
  }

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] py-16 text-center">
        <p className="text-sm text-[#6B6860]">Belum ada permintaan langganan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal preview bukti */}
      {imageUrl && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setImageUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Bukti bayar" className="w-full rounded-xl" />
            <button
              onClick={() => setImageUrl(null)}
              className="mt-3 w-full h-10 rounded-xl bg-[#F0EEE9] text-sm font-semibold text-[#6B6860]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
        <div className="divide-y divide-[#E4E2DC]">
          {list.map((sub) => (
            <div key={sub.id} className="px-5 py-4 flex items-center gap-4">

              {/* Info guru */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1B19]">
                  {sub.profiles?.name ?? "Guru"}
                </p>
                <p className="text-xs text-[#6B6860] mt-0.5">
                  {sub.profiles?.phone ?? "-"} ·{" "}
                  {format(new Date(sub.created_at), "d MMM yyyy, HH.mm", { locale: id })}
                </p>
              </div>

              {/* Plan & nominal */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#1C1B19] capitalize">
                  {sub.plan} Plan
                </p>
                <p className="text-xs font-mono text-brand">
                  {formatRupiah(sub.amount)}
                </p>
              </div>

              {/* Status */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                statusConfig[sub.status]?.class ?? "bg-gray-100 text-gray-600"
              }`}>
                {statusConfig[sub.status]?.label ?? sub.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">

                {/* Lihat bukti */}
                {sub.proof_url && (
                  <button
                    onClick={() => setImageUrl(sub.proof_url)}
                    className="w-8 h-8 rounded-lg border border-[#E4E2DC] flex items-center justify-center hover:bg-[#F0EEE9] transition-colors"
                    title="Lihat bukti"
                  >
                    <Eye size={14} className="text-[#6B6860]" />
                  </button>
                )}

                {/* Approve & Reject hanya untuk pending */}
                {sub.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleAction(sub.id, sub.guru_id, sub.plan, sub.expires_at, "approve")
                      }
                      disabled={loadingId === sub.id}
                      className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors disabled:opacity-60"
                      title="Konfirmasi"
                    >
                      <CheckCircle size={15} className="text-green-700" />
                    </button>
                    <button
                      onClick={() =>
                        handleAction(sub.id, sub.guru_id, sub.plan, sub.expires_at, "reject")
                      }
                      disabled={loadingId === sub.id}
                      className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-60"
                      title="Tolak"
                    >
                      <XCircle size={15} className="text-red-600" />
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </>
  );
}