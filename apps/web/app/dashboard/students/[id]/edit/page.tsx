import { createClient } from "../../../../../lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { StudentEditForm } from "../../../../..//components/students/student-edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLimits } from "../../../../../lib/plan";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: student }, { data: profile }] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .eq("guru_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single(),
  ]);

  if (!student) notFound();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke detail siswa
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1C1B19]">Edit Siswa</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">Ubah data {student.name}</p>
      </div>
      <StudentEditForm student={student} canAutoBilling={limits.recurringInvoice} />
    </div>
  );
}