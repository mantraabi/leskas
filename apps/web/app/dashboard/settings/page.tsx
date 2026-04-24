import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlanCard } from "@/components/settings/plan-card";
import { ProfileForm } from "../../../components/settings/profile-form";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("guru_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-[#1C1B19]">Pengaturan</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">
          Profil & langganan kamu
        </p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-[#E4E2DC]">
        <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
          <h2 className="text-sm font-bold text-[#1C1B19]">Profil</h2>
        </div>
        <div className="p-5">
          <ProfileForm
            id={user.id}
            name={profile?.name ?? ""}
            phone={profile?.phone ?? ""}
            email={user.email ?? ""}
          />
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-xl border border-[#E4E2DC]">
        <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C1B19]">Langganan</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand capitalize">
              {profile?.plan ?? "free"} Plan
            </span>
          </div>
        </div>
        <div className="p-5">
          <PlanCard
            currentPlan={profile?.plan ?? "free"}
            expiresAt={profile?.plan_expires_at ?? null}
            guruId={user.id}
          />
        </div>
      </div>

      {/* Riwayat Langganan */}
      {subscriptions && subscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E4E2DC]">
          <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
            <h2 className="text-sm font-bold text-[#1C1B19]">
              Riwayat Pembayaran
            </h2>
          </div>
          <div className="divide-y divide-[#E4E2DC]">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center px-5 py-3.5 gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1C1B19] capitalize">
                    {sub.plan} Plan
                  </p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    {format(new Date(sub.started_at), "d MMM yyyy", { locale: id })}
                    {" → "}
                    {format(new Date(sub.expires_at), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
                <p className="text-sm font-bold font-mono text-[#1C1B19]">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(sub.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}