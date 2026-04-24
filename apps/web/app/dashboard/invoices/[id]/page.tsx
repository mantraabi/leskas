import { createClient } from "../../../../lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PaymentForm } from "../../../../components/invoices/payment-form";
import { SendWAButton } from "../../../../components/invoices/send-wa-button";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig = {
  unpaid:  { label: "Belum Bayar", class: "bg-amber-50 text-amber-700" },
  partial: { label: "Sebagian",    class: "bg-blue-50 text-blue-700" },
  paid:    { label: "Lunas",       class: "bg-green-50 text-green-700" },
  overdue: { label: "Terlambat",   class: "bg-red-50 text-red-600" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, students(name, parent_name, parent_phone)")
    .eq("id", invoiceId)
    .eq("guru_id", user.id)
    .single();

  if (!invoice) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("paid_at", { ascending: false });

  const status = statusConfig[invoice.status as keyof typeof statusConfig];
  const sisaTagihan = invoice.amount - invoice.amount_paid;

  return (
    <div className="max-w-xl mx-auto">

      {/* Back */}
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B6860] hover:text-[#1C1B19] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke tagihan
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#1C1B19]">Detail Tagihan</h1>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.class}`}>
          {status.label}
        </span>
      </div>

      {/* Info Tagihan */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] divide-y divide-[#E4E2DC] mb-4">
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Siswa</p>
          <p className="text-sm font-semibold text-[#1C1B19]">
            {invoice.students?.name}
          </p>
        </div>
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">No. WA Ortu</p>
          <p className="text-sm font-medium text-[#1C1B19]">
            {invoice.students?.parent_phone ?? "-"}
          </p>
        </div>
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Total Tagihan</p>
          <p className="text-sm font-bold font-mono text-[#1C1B19]">
            {formatRupiah(invoice.amount)}
          </p>
        </div>
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Sudah Dibayar</p>
          <p className="text-sm font-bold font-mono text-green-700">
            {formatRupiah(invoice.amount_paid)}
          </p>
        </div>
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Sisa</p>
          <p className={`text-sm font-bold font-mono ${sisaTagihan > 0 ? "text-red-600" : "text-green-700"}`}>
            {formatRupiah(sisaTagihan)}
          </p>
        </div>
        <div className="flex items-center px-5 py-4 gap-4">
          <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Jatuh Tempo</p>
          <p className="text-sm font-medium text-[#1C1B19]">
            {format(new Date(invoice.due_date), "d MMMM yyyy", { locale: id })}
          </p>
        </div>
        {invoice.notes && (
          <div className="flex items-start px-5 py-4 gap-4">
            <p className="text-sm text-[#6B6860] w-36 flex-shrink-0">Catatan</p>
            <p className="text-sm text-[#1C1B19]">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Kirim WA */}
        {invoice.status !== "paid" && (
          <div className="bg-white rounded-xl border border-[#E4E2DC] p-5 mb-4">
            <h2 className="text-sm font-bold text-[#1C1B19] mb-3">
              Kirim Notifikasi
            </h2>
            <SendWAButton
              invoiceId={invoice.id}
              phone={invoice.students?.parent_phone ?? ""}
              namaOrtu={invoice.students?.parent_name ?? "Ortu"}
              namaSiswa={invoice.students?.name ?? "Siswa"}
              nominal={invoice.amount - invoice.amount_paid}
              jatuhTempo={format(new Date(invoice.due_date), "d MMMM yyyy", { locale: id })}
              status={invoice.status}
            />
          </div>
        )}

      {/* Riwayat Pembayaran */}
      {payments && payments.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E4E2DC] mb-4">
          <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
            <h2 className="text-sm font-bold text-[#1C1B19]">Riwayat Pembayaran</h2>
          </div>
          <div className="divide-y divide-[#E4E2DC]">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center px-5 py-3.5 gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1C1B19]">
                    {formatRupiah(p.amount)}
                  </p>
                  <p className="text-xs text-[#6B6860] mt-0.5 capitalize">
                    {p.method} · {format(new Date(p.paid_at), "d MMM yyyy, HH.mm", { locale: id })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Catat Pembayaran */}
      {invoice.status !== "paid" && (
        <div className="bg-white rounded-xl border border-[#E4E2DC]">
          <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
            <h2 className="text-sm font-bold text-[#1C1B19]">Catat Pembayaran</h2>
          </div>
          <div className="p-5">
            <PaymentForm
              invoiceId={invoice.id}
              sisaTagihan={sisaTagihan}
            />
          </div>
        </div>
      )}

    </div>
  );
}