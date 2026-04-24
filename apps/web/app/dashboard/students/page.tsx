import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StudentList } from "../../../components/students/student-list";
import { UserPlus } from "lucide-react";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("guru_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      <StudentList students={students ?? []} />
    </div>
  );
}