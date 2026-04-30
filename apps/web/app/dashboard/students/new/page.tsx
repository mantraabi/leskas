import { StudentForm } from "../../../../components/students/student-form";
import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { getLimits } from "../../../../lib/plan";

export default async function NewStudentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1C1B19]">Tambah Siswa</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">
          Isi data siswa baru kamu
        </p>
      </div>
      <StudentForm canAutoBilling={limits.recurringInvoice} />
    </div>
  );
}