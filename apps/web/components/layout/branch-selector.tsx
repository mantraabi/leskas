"use client";

import { useTransition } from "react";
import { MapPin } from "lucide-react";
import { selectBranch } from "../../lib/actions/branches";

interface Branch {
  id: string;
  name: string;
}

interface Props {
  branches: Branch[];
  selectedBranchId: string | null;
  compact?: boolean;
}

export function BranchSelector({ branches, selectedBranchId, compact }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    startTransition(() => {
      selectBranch(value === "all" ? null : value);
    });
  }

  if (branches.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 ${compact ? "" : "px-3 py-2"}`}>
      <MapPin size={compact ? 12 : 14} className="text-brand flex-shrink-0" />
      <select
        value={selectedBranchId ?? "all"}
        onChange={handleChange}
        disabled={isPending}
        className={`flex-1 min-w-0 bg-transparent outline-none cursor-pointer text-[#1C1B19] truncate disabled:opacity-50 ${
          compact ? "text-[10px] font-medium" : "text-xs font-semibold"
        }`}
      >
        <option value="all">Semua Cabang</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
