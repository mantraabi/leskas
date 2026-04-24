"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { updateSessionStatus } from "../../lib/actions/sessions";

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "done" | "cancelled";
  notes: string | null;
  students: { name: string; subject: string } | null;
}

interface SessionListProps {
  sessions: Session[];
}

const statusConfig = {
  scheduled: { label: "Terjadwal", class: "bg-blue-50 text-blue-700" },
  done: { label: "Selesai", class: "bg-green-50 text-green-700" },
  cancelled: { label: "Batal", class: "bg-gray-100 text-gray-500" },
};

const subjectColors: Record<string, string> = {
  Matematika: "bg-blue-50 text-blue-700",
  Fisika: "bg-purple-50 text-purple-700",
  Kimia: "bg-amber-50 text-amber-700",
  Biologi: "bg-green-50 text-green-700",
  "Bahasa Inggris": "bg-cyan-50 text-cyan-700",
  "Bahasa Indonesia": "bg-rose-50 text-rose-700",
};

function getSubjectColor(subject: string) {
  return subjectColors[subject] ?? "bg-gray-50 text-gray-700";
}

export function SessionList({ sessions }: SessionListProps) {
  const [filter, setFilter] = useState<"all" | "scheduled" | "done" | "cancelled">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = sessions.filter(
    (s) => filter === "all" || s.status === filter
  );

  async function handleStatusChange(id: string, status: "scheduled" | "done" | "cancelled") {
    setLoadingId(id);
    await updateSessionStatus(id, status);
    setLoadingId(null);
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] py-16 text-center">
        <p className="text-4xl mb-3">📅</p>
        <p className="text-sm font-semibold text-[#1C1B19]">Belum ada jadwal</p>
        <p className="text-sm text-[#6B6860] mt-1">Tambahkan sesi mengajar pertama kamu</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Filter */}
      <div className="flex rounded-lg border border-[#E4E2DC] overflow-hidden bg-white w-fit">
        {(["all", "scheduled", "done", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-brand text-white"
                : "text-[#6B6860] hover:bg-[#F0EEE9]"
            }`}
          >
            {f === "all" ? "Semua" : statusConfig[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#6B6860] py-10">
            Tidak ada sesi dengan status ini.
          </p>
        ) : (
          <div className="divide-y divide-[#E4E2DC]">
            {filtered.map((session) => (
              <div key={session.id} className="flex items-center gap-4 px-5 py-4">

                {/* Tanggal */}
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-lg font-bold text-[#1C1B19] leading-none">
                    {format(new Date(session.scheduled_at), "d")}
                  </p>
                  <p className="text-[10px] text-[#6B6860] uppercase mt-0.5">
                    {format(new Date(session.scheduled_at), "MMM", { locale: id })}
                  </p>
                </div>

                {/* Garis */}
                <div className="w-px h-10 bg-[#E4E2DC] flex-shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1B19]">
                    {session.students?.name ?? "Siswa"}
                  </p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    {format(new Date(session.scheduled_at), "HH.mm")} WIB
                    {" · "}
                    {session.duration_minutes} menit
                  </p>
                </div>

                {/* Mata pelajaran */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:block ${getSubjectColor(session.students?.subject ?? "")}`}>
                  {session.students?.subject}
                </span>

                {/* Status dropdown */}
                <select
                  value={session.status}
                  disabled={loadingId === session.id}
                  onChange={(e) =>
                    handleStatusChange(
                      session.id,
                      e.target.value as "scheduled" | "done" | "cancelled"
                    )
                  }
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                    statusConfig[session.status].class
                  } border-transparent`}
                >
                  <option value="scheduled">Terjadwal</option>
                  <option value="done">Selesai</option>
                  <option value="cancelled">Batal</option>
                </select>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}