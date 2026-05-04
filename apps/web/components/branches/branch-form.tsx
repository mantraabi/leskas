"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Plus } from "lucide-react";

export function BranchForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("branches").insert({
      guru_id: user.id,
      name: name.trim(),
      address: address.trim() || null,
    });

    if (error) {
      setError("Gagal menambah cabang. Coba lagi.");
      setLoading(false);
      return;
    }

    setName("");
    setAddress("");
    setLoading(false);
    router.refresh();
  }

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[#E4E2DC] p-5"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Nama cabang (misal: Rumah Utama, Cabang Bintaro)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Alamat (opsional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex items-center justify-center gap-1.5 px-4 h-10 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-60 flex-shrink-0"
        >
          <Plus size={15} />
          {loading ? "Menambah..." : "Tambah"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}
    </form>
  );
}
