import { createClient } from "@/lib/supabase/server";
import { SubscriptionTable } from "@/components/admin/subscription-table";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Hitung total tanpa join, untuk diagnosa RLS
  const { count: totalCount, error: countError } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  const { data: subscriptions, error: queryError } = await supabase
    .from("subscriptions")
    .select("*, profiles(name, phone)")
    .order("created_at", { ascending: false });

  console.log("[admin/subscriptions] uid =", user?.id);
  console.log("[admin/subscriptions] total rows visible (count) =", totalCount, "countError =", countError);
  console.log("[admin/subscriptions] rows returned =", subscriptions?.length, "queryError =", queryError);

  const pending = subscriptions?.filter((s) => s.status === "pending").length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1C1B19]">Manajemen Langganan</h1>
          <p className="text-sm text-[#6B6860] mt-0.5">
            {pending > 0
              ? `${pending} permintaan menunggu konfirmasi`
              : "Semua permintaan sudah diproses"}
          </p>
        </div>
      </div>

      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700 font-medium">
          ⚠️ Ada {pending} pembayaran yang menunggu konfirmasi kamu.
        </div>
      )}

      {/* Diagnostic banner — hapus setelah masalah selesai */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-xs text-slate-700 font-mono">
        <p>uid: {user?.id ?? "(null)"}</p>
        <p>total rows visible (count): {String(totalCount)}</p>
        <p>rows returned: {subscriptions?.length ?? 0}</p>
        {countError && <p className="text-red-600">countError: {countError.message}</p>}
        {queryError && <p className="text-red-600">queryError: {queryError.message}</p>}
      </div>

      <SubscriptionTable subscriptions={subscriptions ?? []} />
    </div>
  );
}