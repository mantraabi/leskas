import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BranchForm } from "@/components/branches/branch-form";
import { BranchList } from "@/components/branches/branch-list";
import { getLimits } from "@/lib/plan";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";

export default async function BranchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);

  if (!limits.branches) {
    return (
      <div className="max-w-2xl mx-auto">
        <UpgradePrompt
          title="Multi-Cabang"
          description="Kelola beberapa lokasi les dan filter data per cabang."
          requiredPlan="business"
          variant="screen"
        />
      </div>
    );
  }

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, address, created_at")
    .eq("guru_id", user.id)
    .order("created_at");

  // Hitung jumlah siswa per cabang
  const { data: studentCounts } = await supabase
    .from("students")
    .select("branch_id")
    .eq("guru_id", user.id)
    .eq("status", "active")
    .not("branch_id", "is", null);

  const countMap: Record<string, number> = {};
  studentCounts?.forEach((s) => {
    if (s.branch_id) {
      countMap[s.branch_id] = (countMap[s.branch_id] ?? 0) + 1;
    }
  });

  const branchesWithCount = (branches ?? []).map((b) => ({
    ...b,
    student_count: countMap[b.id] ?? 0,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke Pengaturan
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1C1B19]">Cabang / Lokasi</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">
          Kelola lokasi mengajar dan filter data per cabang
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <BranchForm />
        <BranchList branches={branchesWithCount} />
      </div>
    </div>
  );
}
