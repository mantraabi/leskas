import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { InvoiceList } from "../../../components/invoices/invoice-list";
import { FilePlus } from "lucide-react";
import { ExportButton } from "@/components/reports/export-button";
import { getSelectedBranch } from "@/lib/actions/branches";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const branchId = await getSelectedBranch();
  let branchStudentIds: string[] | null = null;
  if (branchId) {
    const { data: bs } = await supabase
      .from("students")
      .select("id")
      .eq("guru_id", user.id)
      .eq("branch_id", branchId);
    branchStudentIds = bs?.map((s) => s.id) ?? [];
  }

  let invoicesQ = supabase
    .from("invoices")
    .select("*, students(name, parent_phone)")
    .eq("guru_id", user.id)
    .order("created_at", { ascending: false });
  if (branchStudentIds && branchStudentIds.length > 0)
    invoicesQ = invoicesQ.in("student_id", branchStudentIds);
  else if (branchStudentIds && branchStudentIds.length === 0)
    invoicesQ = invoicesQ.in("student_id", ["__none__"]);

  const { data: invoices } = await invoicesQ;

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