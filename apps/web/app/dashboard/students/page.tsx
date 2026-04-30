import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StudentList } from "@/components/students/student-list";
import { UserPlus } from "lucide-react";
import { getEffectivePlan, getLimits, PLAN_LIMITS } from "@/lib/plan";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: students }, { data: profile }] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .eq("guru_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single(),
  ]);

  const effectivePlan = getEffectivePlan(profile?.plan, profile?.plan_expires_at);
  const limits = getLimits(profile?.plan, profile?.plan_expires_at);
  const activeStudentCount =
    students?.filter((s) => s.status === "active").length ?? 0;
  const maxStudents = limits.maxStudents;
  const isAtLimit = Number.isFinite(maxStudents) && activeStudentCount >= maxStudents;
  const isNearLimit =
    Number.isFinite(maxStudents) && activeStudentCount >= maxStudents - 2;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1B19]">Siswa</h1>
          <p className="text-sm text-[#6B6860] mt-0.5">
            {students?.length ?? 0} siswa terdaftar
          </p>
        </div>
        {isAtLimit ? (
          <button
            type="button"
            disabled
            title="Sudah mencapai batas paket Free"
            className="flex items-center gap-2 px-4 py-2 bg-[#F0EEE9] text-[#9CA3AF] text-sm font-semibold rounded-lg cursor-not-allowed"
          >
            <UserPlus size={15} />
            Tambah Siswa
          </button>
        ) : (
          <Link
            href="/dashboard/students/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
          >
            <UserPlus size={15} />
            Tambah Siswa
          </Link>
        )}
      </div>

      {/* Banner limit Free plan (atau plan expired yang ke-downgrade) */}
      {effectivePlan === "free" && (
        <div className={`rounded-xl border px-5 py-3.5 flex items-center justify-between mb-4 ${
          isAtLimit
            ? "bg-red-50 border-red-200"
            : isNearLimit
            ? "bg-amber-50 border-amber-200"
            : "bg-[#F0EEE9] border-[#E4E2DC]"
        }`}>
          <p className="text-sm text-[#6B6860]">
            <span className="font-semibold text-[#1C1B19]">
              {activeStudentCount}/{PLAN_LIMITS.free.maxStudents} siswa aktif
            </span>
            {" "}— Free Plan
            {isAtLimit && (
              <span className="text-red-700 font-medium"> · Batas tercapai</span>
            )}
            {!isAtLimit && isNearLimit && (
              <span className="text-amber-700 font-medium"> · Hampir penuh!</span>
            )}
            {profile?.plan && profile.plan !== "free" && (
              <span className="text-amber-700 font-medium"> · Paket {profile.plan} sudah berakhir</span>
            )}
          </p>
          <Link
            href="/dashboard/settings"
            className="text-xs font-semibold text-brand hover:underline flex-shrink-0"
          >
            Upgrade ke Pro →
          </Link>
        </div>
      )}

      <StudentList students={students ?? []} />

    </div>
  );
}