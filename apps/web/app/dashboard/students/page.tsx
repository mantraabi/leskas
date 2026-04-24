import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StudentList } from "@/components/students/student-list";
import { UserPlus } from "lucide-react";

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
      .select("plan")
      .eq("id", user.id)
      .single(),
  ]);

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
        <Link
          href="/dashboard/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
        >
          <UserPlus size={15} />
          Tambah Siswa
        </Link>
      </div>

      {/* Banner limit Free plan */}
      {profile?.plan === "free" && (
        <div className={`rounded-xl border px-5 py-3.5 flex items-center justify-between mb-4 ${
          (students?.length ?? 0) >= 8
            ? "bg-amber-50 border-amber-200"
            : "bg-[#F0EEE9] border-[#E4E2DC]"
        }`}>
          <p className="text-sm text-[#6B6860]">
            <span className="font-semibold text-[#1C1B19]">
              {students?.length ?? 0}/10 siswa
            </span>
            {" "}— Free Plan
            {(students?.length ?? 0) >= 8 && (
              <span className="text-amber-700 font-medium"> · Hampir penuh!</span>
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