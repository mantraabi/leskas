"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { MapPin, Pencil, Trash2, Check, X } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  student_count: number;
}

export function BranchList({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus cabang "${name}"? Siswa di cabang ini akan jadi tanpa cabang.`)) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) {
      setError("Gagal menghapus cabang.");
    }
    setLoading(false);
    router.refresh();
  }

  function startEdit(branch: Branch) {
    setEditId(branch.id);
    setEditName(branch.name);
    setEditAddress(branch.address ?? "");
    setError("");
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("branches")
      .update({ name: editName.trim(), address: editAddress.trim() || null })
      .eq("id", editId);
    if (error) {
      setError("Gagal menyimpan.");
    } else {
      setEditId(null);
    }
    setLoading(false);
    router.refresh();
  }

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] py-16 text-center">
        <p className="text-4xl mb-3">📍</p>
        <p className="text-sm font-semibold text-[#1C1B19]">Belum ada cabang</p>
        <p className="text-sm text-[#6B6860] mt-1">
          Tambahkan cabang/lokasi pertama kamu di atas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="bg-white rounded-xl border border-[#E4E2DC] divide-y divide-[#E4E2DC] overflow-hidden">
        {branches.map((branch) => (
          <div key={branch.id} className="flex items-center gap-3 px-5 py-4">
            {editId === branch.id ? (
              <>
                <MapPin size={16} className="text-brand flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 px-2 rounded border border-[#E4E2DC] text-sm outline-none focus:border-brand"
                    placeholder="Nama cabang"
                  />
                  <input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="h-8 px-2 rounded border border-[#E4E2DC] text-xs outline-none focus:border-brand"
                    placeholder="Alamat (opsional)"
                  />
                </div>
                <button
                  onClick={saveEdit}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                  title="Simpan"
                >
                  <Check size={15} />
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="p-1.5 rounded-lg text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
                  title="Batal"
                >
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <MapPin size={16} className="text-brand flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1B19]">{branch.name}</p>
                  {branch.address && (
                    <p className="text-xs text-[#6B6860] mt-0.5 truncate">{branch.address}</p>
                  )}
                </div>
                <span className="text-xs text-[#6B6860] bg-[#F0EEE9] px-2 py-1 rounded-full flex-shrink-0">
                  {branch.student_count} siswa
                </span>
                <button
                  onClick={() => startEdit(branch)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(branch.id, branch.name)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
