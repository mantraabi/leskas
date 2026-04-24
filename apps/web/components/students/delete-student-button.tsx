"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  name: string;
}

export function DeleteStudentButton({ id, name }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Hapus siswa "${name}"? Data yang sudah dihapus tidak bisa dikembalikan.`
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from("students").delete().eq("id", id);

    router.push("/dashboard/students");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
    >
      <Trash2 size={13} />
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}