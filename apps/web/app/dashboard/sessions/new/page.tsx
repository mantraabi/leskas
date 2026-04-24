import { createClient } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { SessionForm } from "../../../../components/sessions/session-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: students } = await supabase
    .from("students")
    .select("id, name, subject")
    .eq("guru_id", user.id)
    .eq("status", "active")
    .order("name");

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/dashboard/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke jadwal
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1C1B19]">Tambah Sesi</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">Catat sesi mengajar baru</p>
      </div>
      <SessionForm students={students ?? []} />
    </div>
  );
}