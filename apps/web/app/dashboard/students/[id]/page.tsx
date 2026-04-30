import { createClient } from "../../../../lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { DeleteStudentButton } from "../../../../components/students/delete-student-button";
import { ParentPortalShare } from "../../../../components/students/parent-portal-share";
import { getLimits } from "../../../../lib/plan";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
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

  const fields = [
    { label: "Mata Pelajaran", value: student.subject },
    { label: "Kelas", value: student.grade ?? "-" },
    { label: "Nama Orang Tua", value: student.parent_name ?? "-" },
    { label: "No. WA Orang Tua", value: student.parent_phone ?? "-" },
    { label: "Status", value: student.status === "active" ? "Aktif" : "Nonaktif" },
    { label: "Catatan", value: student.notes ?? "-" },
  ];

  return (
    <div className="max-w-xl mx-auto">

      {/* Back */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke daftar siswa
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1C1B19]">{student.name}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/students/${student.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E2DC] text-sm font-medium text-[#6B6860] hover:bg-[#F0EEE9] transition-colors"
          >
            <Pencil size={13} />
            Edit
          </Link>
          <DeleteStudentButton id={student.id} name={student.name} />
        </div>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] divide-y divide-[#E4E2DC] mb-5">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-start px-5 py-4 gap-4">
            <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">{label}</p>
            <p className="text-sm font-medium text-[#1C1B19]">{value}</p>
          </div>
        ))}
      </div>

      {/* Portal Orang Tua (Business) */}
      <ParentPortalShare
        studentName={student.name}
        parentName={student.parent_name}
        parentPhone={student.parent_phone}
        portalToken={student.portal_token}
        enabled={limits.parentPortal}
      />

    </div>
  );
}