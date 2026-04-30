"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "../../lib/supabase/client";
import { Upload, Trash2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
  userId: string;
  currentLogoUrl: string | null;
  currentColor: string | null;
  enabled: boolean;
}

const DEFAULT_COLOR = "#1A6B5A"; // brand hijau LesKas
const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function BrandingForm({ userId, currentLogoUrl, currentColor, enabled }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [color, setColor] = useState(currentColor ?? DEFAULT_COLOR);
  const [uploading, setUploading] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [error, setError] = useState("");
  const [colorSaved, setColorSaved] = useState(false);

  if (!enabled) {
    return (
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0EEE9] text-[#9CA3AF] flex items-center justify-center flex-shrink-0">
          <Lock size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#6B6860]">
            Tampilkan logo & warna khas tempat les kamu di Portal Orang Tua dan email
            tagihan. Tersedia di paket{" "}
            <span className="font-semibold text-brand">Business</span>.
          </p>
          <Link
            href="#langganan"
            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-brand hover:underline"
          >
            <Sparkles size={12} />
            Upgrade ke Business
          </Link>
        </div>
      </div>
    );
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format harus PNG, JPG, WEBP, atau SVG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Ukuran maksimal 1 MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const filePath = `brand-logos/${userId}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("assets")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      setError(`Gagal upload: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { error: profErr } = await supabase
      .from("profiles")
      .update({ brand_logo_url: publicUrl })
      .eq("id", userId);

    if (profErr) {
      setError(`Gagal simpan: ${profErr.message}`);
      setUploading(false);
      return;
    }

    setLogoUrl(publicUrl);
    setUploading(false);
    router.refresh();
  }

  async function handleRemoveLogo() {
    if (!confirm("Hapus logo tempat les kamu?")) return;

    setError("");
    const supabase = createClient();
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ brand_logo_url: null })
      .eq("id", userId);

    if (profErr) {
      setError(`Gagal hapus: ${profErr.message}`);
      return;
    }

    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleSaveColor() {
    setError("");
    setSavingColor(true);
    const supabase = createClient();
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ brand_color: color === DEFAULT_COLOR ? null : color })
      .eq("id", userId);

    if (profErr) {
      setError(`Gagal simpan warna: ${profErr.message}`);
      setSavingColor(false);
      return;
    }

    setColorSaved(true);
    setSavingColor(false);
    setTimeout(() => setColorSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Logo */}
      <div>
        <p className="text-sm font-medium text-[#1C1B19] mb-2">Logo Tempat Les</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-[#E4E2DC] bg-[#F5F4F0] flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                unoptimized
              />
            ) : (
              <span className="text-[10px] text-[#9B9890]">No logo</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleLogoChange}
              className="hidden"
              id="logo-input"
            />
            <div className="flex gap-2">
              <label
                htmlFor="logo-input"
                className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-[#E4E2DC] text-xs font-semibold cursor-pointer transition-colors ${
                  uploading ? "opacity-60 cursor-wait" : "text-[#6B6860] hover:bg-[#F0EEE9]"
                }`}
              >
                <Upload size={13} />
                {uploading ? "Uploading..." : logoUrl ? "Ganti Logo" : "Upload Logo"}
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#9B9890]">
              PNG / JPG / WEBP / SVG · Maksimal 1 MB · Disarankan rasio 1:1 atau bujur
            </p>
          </div>
        </div>
      </div>

      {/* Color */}
      <div className="border-t border-[#E4E2DC] pt-5">
        <p className="text-sm font-medium text-[#1C1B19] mb-2">Warna Brand</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 rounded-lg border border-[#E4E2DC] cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#1A6B5A"
            className="w-28 h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm font-mono outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => setColor(DEFAULT_COLOR)}
            className="text-xs text-[#6B6860] hover:text-[#1C1B19] underline"
          >
            Reset default
          </button>
          <button
            type="button"
            onClick={handleSaveColor}
            disabled={savingColor}
            className="ml-auto h-10 px-4 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {savingColor ? "Menyimpan..." : colorSaved ? "Tersimpan ✓" : "Simpan Warna"}
          </button>
        </div>
        <p className="text-[11px] text-[#9B9890] mt-2">
          Akan tampil di Portal Orang Tua sebagai aksen warna utama.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
