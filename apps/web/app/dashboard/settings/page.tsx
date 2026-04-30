import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlanCard } from "@/components/settings/plan-card";
import { ProfileForm } from "../../../components/settings/profile-form";
import { BrandingForm } from "../../../components/settings/branding-form";
import { getLimits } from "@/lib/plan";
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

  // Subscription terbaru untuk banner status
  const latestSub = subscriptions?.[0];

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-[#1C1B19]">Pengaturan</h1>
        <p className="text-sm text-[#6B6860] mt-0.5">
          Profil & langganan kamu
        </p>
      </div>

      {/* Banner status langganan terakhir */}
      {latestSub?.status === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">⏳</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Bukti pembayaran kamu sedang ditinjau
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Admin akan memverifikasi pembayaran <span className="capitalize">{latestSub.plan}</span> Plan
              kamu dalam 1×24 jam. Plan akan otomatis aktif setelah dikonfirmasi.
            </p>
          </div>
        </div>
      )}

      {latestSub?.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Pengajuan langganan ditolak
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Bukti pembayaran <span className="capitalize">{latestSub.plan}</span> Plan kamu tidak dapat
              diverifikasi. Silakan upload ulang bukti yang valid, atau hubungi admin LesKas
              untuk bantuan.
            </p>
          </div>
        </div>
      )}

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

      {/* Branding Kustom (Business) */}
      <div className="bg-white rounded-xl border border-[#E4E2DC]">
        <div className="px-5 py-3.5 border-b border-[#E4E2DC] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1C1B19]">Branding Kustom</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
            Business
          </span>
        </div>
        <div className="p-5">
          <BrandingForm
            userId={user.id}
            currentLogoUrl={profile?.brand_logo_url ?? null}
            currentColor={profile?.brand_color ?? null}
            enabled={limits.customBranding}
          />
        </div>
      </div>

      {/* Plan */}
      <div id="langganan" className="bg-white rounded-xl border border-[#E4E2DC]">
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
            {subscriptions.map((sub) => {
              const statusMeta =
                sub.status === "active"
                  ? { label: "Aktif", class: "bg-emerald-100 text-emerald-700" }
                  : sub.status === "pending"
                  ? { label: "Menunggu konfirmasi", class: "bg-amber-100 text-amber-700" }
                  : sub.status === "rejected"
                  ? { label: "Ditolak", class: "bg-red-100 text-red-700" }
                  : sub.status === "expired"
                  ? { label: "Kedaluwarsa", class: "bg-slate-100 text-slate-600" }
                  : { label: sub.status, class: "bg-slate-100 text-slate-600" };

              const periodeText =
                sub.status === "active" && sub.started_at && sub.expires_at
                  ? `${format(new Date(sub.started_at), "d MMM yyyy", { locale: id })} → ${format(
                      new Date(sub.expires_at),
                      "d MMM yyyy",
                      { locale: id }
                    )}`
                  : sub.status === "pending"
                  ? `Diajukan ${format(new Date(sub.created_at), "d MMM yyyy, HH.mm", { locale: id })}`
                  : sub.status === "rejected"
                  ? `Ditolak admin · diajukan ${format(new Date(sub.created_at), "d MMM yyyy", {
                      locale: id,
                    })}`
                  : `Diajukan ${format(new Date(sub.created_at), "d MMM yyyy", { locale: id })}`;

              return (
                <div key={sub.id} className="flex items-center px-5 py-3.5 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#1C1B19] capitalize">
                        {sub.plan} Plan
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.class}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6860] mt-0.5">{periodeText}</p>
                  </div>
                  <p className="text-sm font-bold font-mono text-[#1C1B19] flex-shrink-0">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(sub.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}