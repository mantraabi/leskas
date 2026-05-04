import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { getLimits } from "@/lib/plan";
import { getSelectedBranch } from "@/lib/actions/branches";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch admin, profile, branches paralel
  const [{ data: admin }, { data: profile }, { data: branches }] = await Promise.all([
    supabase.from("admins").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("name, plan, plan_expires_at").eq("id", user.id).single(),
    supabase
      .from("branches")
      .select("id, name")
      .eq("guru_id", user.id)
      .order("created_at"),
  ]);

  if (admin) redirect("/admin");

  const name = profile?.name ?? "Guru";
  const plan = profile?.plan ?? "free";
  const limits = getLimits(profile?.plan, profile?.plan_expires_at);
  const canBranches = limits.branches && (branches?.length ?? 0) > 0;
  const selectedBranchId = canBranches ? await getSelectedBranch() : null;

  return (
    <div className="flex md:h-screen md:overflow-hidden bg-[#F5F4F0]">
      <Sidebar
        name={name}
        plan={plan}
        branches={canBranches ? branches ?? [] : []}
        selectedBranchId={selectedBranchId}
      />
      <div className="flex flex-col flex-1 md:overflow-hidden min-w-0">
        <MobileHeader
          name={name}
          plan={plan}
          branches={canBranches ? branches ?? [] : []}
          selectedBranchId={selectedBranchId}
        />
        <main className="flex-1 md:overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-5 md:px-5 md:pt-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}