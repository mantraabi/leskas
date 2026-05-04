"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  paymentId: string;
  /** Kalau false, tampilkan locked state dengan link upgrade */
  enabled: boolean;
  /** Optional portal token untuk akses publik */
  portalToken?: string;
  size?: "sm" | "md";
}

export function DownloadReceiptButton({
  paymentId,
  enabled,
  portalToken,
  size = "sm",
}: Props) {
  if (!enabled) {
    return (
      <Link
        href="/dashboard/settings#langganan"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
        title="Upgrade ke Pro untuk download kwitansi PDF"
      >
        <Lock size={11} />
        Kwitansi PDF (Pro)
      </Link>
    );
  }

  const url = portalToken
    ? `/api/receipts/${paymentId}?token=${encodeURIComponent(portalToken)}`
    : `/api/receipts/${paymentId}`;

  const sizeClass =
    size === "md"
      ? "px-3 py-2 text-sm"
      : "px-2.5 py-1.5 text-[11px]";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold text-brand bg-brand/5 hover:bg-brand/10 transition-colors ${sizeClass}`}
      title="Unduh kwitansi PDF resmi"
    >
      <Download size={size === "md" ? 14 : 11} />
      Kwitansi PDF
    </a>
  );
}
