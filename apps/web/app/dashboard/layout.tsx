import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch admin & profile paralel — mempercepat render layout
  const [{ data: admin }, { data: profile }] = await Promise.all([
    supabase.from("admins").select("id").eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("name, plan").eq("id", user.id).single(),
  ]);

  if (admin) redirect("/admin");

  const name = profile?.name ?? "Guru";
  const plan = profile?.plan ?? "free";

  return (
    <div className="flex md:h-screen md:overflow-hidden bg-[#F5F4F0]">
      <Sidebar name={name} plan={plan} />
      <div className="flex flex-col flex-1 md:overflow-hidden min-w-0">
        <MobileHeader name={name} plan={plan} />
        <main className="flex-1 md:overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-5 md:px-5 md:pt-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}