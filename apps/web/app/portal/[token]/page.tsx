import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectivePlan } from "@/lib/plan";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { GraduationCap, Receipt, History, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

interface StudentRow {
  id: string;
  name: string;
  subject: string;
  grade: string | null;
  parent_name: string | null;
  guru_id: string;
  profiles: { name: string | null; plan: string | null; plan_expires_at: string | null } | null;
}

interface InvoiceRow {
  id: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  paid_at: string;
  method: string | null;
  invoices: { id: string } | null;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  unpaid:  { label: "Belum Bayar", class: "bg-amber-50 text-amber-700 border-amber-200" },
  partial: { label: "Sebagian",    class: "bg-blue-50 text-blue-700 border-blue-200" },
  paid:    { label: "Lunas",       class: "bg-green-50 text-green-700 border-green-200" },
  overdue: { label: "Terlambat",   class: "bg-red-50 text-red-600 border-red-200" },
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

// UUID v4 simple validation — biar ga query DB kalau token jelas-jelas invalid
function isValidUuid(token: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
}

export default async function ParentPortalPage({ params }: Props) {
  const { token } = await params;

  if (!isValidUuid(token)) notFound();

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, name, subject, grade, parent_name, guru_id, profiles!students_guru_id_fkey(name, plan, plan_expires_at)"
    )
    .eq("portal_token", token)
    .maybeSingle<StudentRow>();

  if (!student) notFound();

  // Gate: portal hanya aktif kalau guru-nya plan Business efektif.
  const plan = getEffectivePlan(student.profiles?.plan, student.profiles?.plan_expires_at);
  if (plan !== "business") {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} />
        </div>
        <h1 className="text-lg font-bold text-[#1C1B19]">Portal tidak aktif</h1>
        <p className="text-sm text-[#6B6860] mt-2">
          Portal orang tua untuk siswa ini sedang tidak aktif. Silakan hubungi pengajar untuk
          informasi tagihan terbaru.
        </p>
      </div>
    );
  }

  const [{ data: invoices }, { data: payments }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, amount, amount_paid, due_date, status, notes, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .returns<InvoiceRow[]>(),
    supabase
      .from("payments")
      .select("id, amount, paid_at, method, invoices!inner(id, student_id)")
      .eq("invoices.student_id", student.id)
      .order("paid_at", { ascending: false })
      .limit(20)
      .returns<PaymentRow[]>(),
  ]);

  const activeInvoices = (invoices ?? []).filter((inv) => inv.status !== "paid");
  const paidInvoices = (invoices ?? []).filter((inv) => inv.status === "paid");

  const totalSisa = activeInvoices.reduce(
    (sum, inv) => sum + (inv.amount - inv.amount_paid),
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">

      {/* Header dari guru */}
      <div className="bg-white border border-[#E4E2DC] rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#6B6860]">Portal Tagihan</p>
          <p className="text-sm font-semibold text-[#1C1B19] truncate">
            {student.profiles?.name ?? "Tempat Les"}
          </p>
        </div>
      </div>

      {/* Identitas Siswa */}
      <div className="bg-white border border-[#E4E2DC] rounded-2xl p-5 mb-5">
        <p className="text-xs text-[#6B6860] mb-1">Siswa</p>
        <h1 className="text-xl font-bold text-[#1C1B19]">{student.name}</h1>
        <p className="text-sm text-[#6B6860] mt-1">
          {student.subject}
          {student.grade ? ` · Kelas ${student.grade}` : ""}
          {student.parent_name ? ` · Ortu: ${student.parent_name}` : ""}
        </p>

        {totalSisa > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">Total tagihan belum lunas</p>
            <p className="text-lg font-bold text-amber-900 mt-0.5">
              {formatRupiah(totalSisa)}
            </p>
          </div>
        )}
      </div>

      {/* Tagihan Aktif */}
      <div className="bg-white border border-[#E4E2DC] rounded-2xl mb-5 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E4E2DC] flex items-center gap-2">
          <Receipt size={15} className="text-[#6B6860]" />
          <h2 className="text-sm font-bold text-[#1C1B19]">Tagihan Aktif</h2>
          <span className="ml-auto text-xs text-[#6B6860]">
            {activeInvoices.length} tagihan
          </span>
        </div>

        {activeInvoices.length === 0 ? (
          <p className="text-sm text-[#6B6860] text-center py-8">
            Tidak ada tagihan aktif. Terima kasih! 🎉
          </p>
        ) : (
          <div className="divide-y divide-[#E4E2DC]">
            {activeInvoices.map((inv) => {
              const cfg = statusConfig[inv.status] ?? statusConfig.unpaid!;
              const sisa = inv.amount - inv.amount_paid;
              return (
                <div key={inv.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1C1B19]">
                        {inv.notes ?? "Tagihan"}
                      </p>
                      <p className="text-xs text-[#6B6860] mt-0.5">
                        Jatuh tempo {format(new Date(inv.due_date), "d MMM yyyy", { locale: id })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.class}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-dashed border-[#E4E2DC]">
                    <p className="text-xs text-[#6B6860]">Sisa tagihan</p>
                    <p className="text-base font-bold text-[#1C1B19]">{formatRupiah(sisa)}</p>
                  </div>
                  {inv.amount_paid > 0 && (
                    <p className="text-[11px] text-[#6B6860] text-right mt-1">
                      Sudah dibayar {formatRupiah(inv.amount_paid)} dari {formatRupiah(inv.amount)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Riwayat Pembayaran */}
      {(payments?.length ?? 0) > 0 && (
        <div className="bg-white border border-[#E4E2DC] rounded-2xl mb-5 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E4E2DC] flex items-center gap-2">
            <History size={15} className="text-[#6B6860]" />
            <h2 className="text-sm font-bold text-[#1C1B19]">Riwayat Pembayaran</h2>
          </div>
          <div className="divide-y divide-[#E4E2DC]">
            {payments?.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1C1B19]">
                    {format(new Date(p.paid_at), "d MMMM yyyy", { locale: id })}
                  </p>
                  {p.method && (
                    <p className="text-xs text-[#6B6860] mt-0.5">{p.method}</p>
                  )}
                </div>
                <p className="text-sm font-bold text-green-700 flex-shrink-0">
                  {formatRupiah(p.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tagihan Lunas (kompak) */}
      {paidInvoices.length > 0 && (
        <details className="bg-white border border-[#E4E2DC] rounded-2xl mb-5">
          <summary className="px-5 py-3.5 cursor-pointer text-sm font-medium text-[#6B6860] hover:text-[#1C1B19]">
            Tagihan lunas sebelumnya ({paidInvoices.length})
          </summary>
          <div className="divide-y divide-[#E4E2DC] border-t border-[#E4E2DC]">
            {paidInvoices.slice(0, 12).map((inv) => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[#1C1B19]">{inv.notes ?? "Tagihan"}</p>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    {format(new Date(inv.due_date), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
                <p className="text-sm font-medium text-[#6B6860]">
                  {formatRupiah(inv.amount)}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-[#9B9890] mt-8">
        Halaman ini dibuat untuk orang tua / wali siswa · Powered by LesKas
      </p>

    </div>
  );
}
