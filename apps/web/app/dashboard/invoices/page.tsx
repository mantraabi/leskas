import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { InvoiceList } from "../../../components/invoices/invoice-list";
import { FilePlus } from "lucide-react";
import { ExportButton } from "@/components/reports/export-button";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, students(name, parent_phone)")
    .eq("guru_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-xl font-bold text-[#1C1B19]">Tagihan</h1>
    <p className="text-sm text-[#6B6860] mt-0.5">
      {invoices?.length ?? 0} tagihan tercatat
    </p>
  </div>
  <div className="flex items-center gap-2">
    <ExportButton invoices={invoices ?? []} />
    <Link
      href="/dashboard/invoices/new"
      className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
    >
      <FilePlus size={15} />
      Buat Tagihan
    </Link>
  </div>
</div>

      <InvoiceList invoices={invoices ?? []} />
    </div>
  );
}