import { createClient } from "@/lib/supabase/server";
import { SubscriptionTable } from "@/components/admin/subscription-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, profiles(name, phone)")
    .order("created_at", { ascending: false });

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

      <SubscriptionTable subscriptions={subscriptions ?? []} />
    </div>
  );
}