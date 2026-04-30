"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Repeat } from "lucide-react";

interface Student {
  id: string;
  name: string;
  subject: string;
  grade: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  status: "active" | "inactive";
  created_at: string;
  auto_billing_enabled?: boolean | null;
}

interface StudentListProps {
  students: Student[];
}

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-purple-100 text-purple-700",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx] ?? avatarColors[0];
}

export function StudentList({ students }: StudentListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E2DC] py-16 text-center">
        <p className="text-4xl mb-3">👨‍🎓</p>
        <p className="text-sm font-semibold text-[#1C1B19]">Belum ada siswa</p>
        <p className="text-sm text-[#6B6860] mt-1 mb-4">
          Tambahkan siswa pertama kamu
        </p>
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
        >
          Tambah Siswa
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari nama atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E4E2DC] bg-white text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
        <div className="flex rounded-lg border border-[#E4E2DC] overflow-hidden bg-white">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-brand text-white"
                  : "text-[#6B6860] hover:bg-[#F0EEE9]"
              }`}
            >
              {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Nonaktif"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#6B6860] py-10">
            Tidak ada siswa yang cocok dengan pencarian.
          </p>
        ) : (
          <div className="divide-y divide-[#E4E2DC]">
            {filtered.map((student) => (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F5F4F0] transition-colors"
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(student.name)}`}
                >
                  {getInitials(student.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1B19]">
                    {student.name}
                  </p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    {student.parent_name && `Ortu: ${student.parent_name}`}
                    {student.parent_name && student.grade && " · "}
                    {student.grade && `Kelas ${student.grade}`}
                  </p>
                </div>

                {/* Auto-billing badge */}
                {student.auto_billing_enabled && (
                  <span
                    title="Tagihan otomatis aktif"
                    className="hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-brand/10 text-brand"
                  >
                    <Repeat size={10} />
                    Auto
                  </span>
                )}

                {/* Subject */}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getSubjectColor(student.subject)}`}
                >
                  {student.subject}
                </span>

                {/* Status */}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    student.status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {student.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}