"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, MessageCircle, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  studentName: string;
  parentName: string | null;
  parentPhone: string | null;
  portalToken: string;
  /** True kalau guru di paket Business — boleh pakai Portal Ortu */
  enabled: boolean;
}

function buildPortalUrl(token: string) {
  if (typeof window === "undefined") return `/portal/${token}`;
  return `${window.location.origin}/portal/${token}`;
}

function buildWhatsAppUrl(phone: string, message: string) {
  // Normalisasi nomor: hilangkan non-digit, ganti leading 0 dengan 62
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function ParentPortalShare({
  studentName,
  parentName,
  parentPhone,
  portalToken,
  enabled,
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!enabled) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0EEE9] text-[#9CA3AF] flex items-center justify-center flex-shrink-0">
            <Lock size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1C1B19]">Portal Orang Tua</p>
            <p className="text-xs text-[#6B6860] mt-1">
              Bagikan link unik ke orang tua agar mereka bisa cek tagihan & riwayat pembayaran
              tanpa perlu login. Tersedia di paket{" "}
              <span className="font-semibold text-brand">Business</span>.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-block mt-3 text-xs font-semibold text-brand hover:underline"
            >
              Upgrade ke Business →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const portalUrl = buildPortalUrl(portalToken);
  const greeting = parentName ? `Halo ${parentName},` : "Halo,";
  const message =
    `${greeting}\n\nBerikut link Portal Orang Tua untuk ${studentName}. ` +
    `Anda bisa cek tagihan & riwayat pembayaran kapan saja:\n\n${portalUrl}\n\nTerima kasih.`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: pilih text
      window.prompt("Copy link ini:", portalUrl);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#1C1B19]">Portal Orang Tua</h2>
          <p className="text-xs text-[#6B6860] mt-0.5">
            Bagikan link ini ke ortu untuk akses tagihan tanpa login.
          </p>
        </div>
      </div>

      {/* URL Box */}
      <div className="flex items-center gap-2 bg-[#F5F4F0] border border-[#E4E2DC] rounded-lg px-3 py-2 mb-3">
        <code className="text-xs text-[#1C1B19] truncate flex-1 font-mono">
          {portalUrl}
        </code>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6B6860] hover:text-brand transition-colors flex-shrink-0"
          title="Buka di tab baru"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-[#E4E2DC] text-xs font-semibold text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
        >
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          {copied ? "Tercopy!" : "Copy Link"}
        </button>
        {parentPhone ? (
          <a
            href={buildWhatsAppUrl(parentPhone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1ebe5d] transition-colors"
          >
            <MessageCircle size={13} />
            Kirim ke WA Ortu
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="No. WA ortu belum diisi"
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#F0EEE9] text-[#9CA3AF] text-xs font-semibold cursor-not-allowed"
          >
            <MessageCircle size={13} />
            Kirim ke WA Ortu
          </button>
        )}
      </div>
    </div>
  );
}
