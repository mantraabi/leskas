import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SessionList } from "../../../components/sessions/session-list";
import { CalendarPlus } from "lucide-react";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, students(name, subject)")
    .eq("guru_id", user.id)
    .order("scheduled_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1C1B19]">Jadwal</h1>
          <p className="text-sm text-[#6B6860] mt-0.5">
            {sessions?.length ?? 0} sesi tercatat
          </p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
        >
          <CalendarPlus size={15} />
          Tambah Sesi
        </Link>
      </div>

      <SessionList sessions={sessions ?? []} />
    </div>
  );
}