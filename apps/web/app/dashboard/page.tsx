import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusConfig = {
  unpaid:  { label: "Belum Bayar", class: "bg-amber-50 text-amber-700" },
  partial: { label: "Sebagian",    class: "bg-blue-50 text-blue-700" },
  paid:    { label: "Lunas",       class: "bg-green-50 text-green-700" },
  overdue: { label: "Terlambat",   class: "bg-red-50 text-red-600" },
};

const sessionStatusConfig = {
  scheduled: { label: "Terjadwal", class: "bg-blue-50 text-blue-700" },
  done:      { label: "Selesai",   class: "bg-green-50 text-green-700" },
  cancelled: { label: "Batal",     class: "bg-gray-100 text-gray-500" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const now = new Date();
  const bulanIniStart = startOfMonth(now).toISOString();
  const bulanIniEnd = endOfMonth(now).toISOString();
  const hariIniStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const hariIniEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  const [
    { count: totalSiswa },
    { data: invoices },
    { data: sessions },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("guru_id", user.id)
      .eq("status", "active"),
    supabase
      .from("invoices")
      .select("*, students(name)")
      .eq("guru_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("sessions")
      .select("*, students(name, subject)")
      .eq("guru_id", user.id)
      .gte("scheduled_at", hariIniStart)
      .lte("scheduled_at", hariIniEnd)
      .order("scheduled_at"),
    supabase
      .from("payments")
      .select("amount, invoices!inner(guru_id)")
      .eq("invoices.guru_id", user.id)
      .gte("paid_at", bulanIniStart)
      .lte("paid_at", bulanIniEnd),
  ]);

  const pemasukanBulanIni = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const totalBelumBayar = invoices
    ?.filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .reduce((sum, inv) => sum + (inv.amount - inv.amount_paid), 0) ?? 0;

  const jumlahBelumBayar = invoices?.filter(
    (inv) => inv.status === "unpaid" || inv.status === "overdue"
  ).length ?? 0;

  const stats = [
    {
      label: "Pemasukan Bulan Ini",
      value: formatRupiah(pemasukanBulanIni),
      sub: format(now, "MMMM yyyy", { locale: id }),
      highlight: true,
    },
    {
      label: "Belum Dibayar",
      value: formatRupiah(totalBelumBayar),
      sub: `${jumlahBelumBayar} tagihan menunggu`,
      warning: jumlahBelumBayar > 0,
    },
    {
      label: "Siswa Aktif",
      value: totalSiswa?.toString() ?? "0",
      sub: "siswa terdaftar",
    },
    {
      label: "Sesi Hari Ini",
      value: sessions?.length.toString() ?? "0",
      sub: "sesi dijadwalkan",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-[#1C1B19]">Dashboard</h1>
        <p className="text-sm text-[#6B6860] mt-0.5 capitalize">
          {format(now, "EEEE, d MMMM yyyy", { locale: id })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${
              stat.highlight
                ? "bg-brand/5 border-brand/20"
                : stat.warning
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-[#E4E2DC]"
            }`}
          >
            <p className="text-[11px] font-medium text-[#6B6860] mb-2">
              {stat.label}
            </p>
            <p className={`text-xl font-bold font-mono tracking-tight ${
              stat.highlight ? "text-brand" : stat.warning ? "text-amber-700" : "text-[#1C1B19]"
            }`}>
              {stat.value}
            </p>
            <p className="text-[11px] text-[#6B6860] mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Grid bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Tagihan Terbaru */}
        <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2DC]">
            <h2 className="text-sm font-bold text-[#1C1B19]">Tagihan Terbaru</h2>
            <Link href="/dashboard/invoices" className="text-xs text-brand font-semibold hover:underline">
              Lihat semua →
            </Link>
          </div>
          {!invoices || invoices.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6B6860]">
              Belum ada tagihan.{" "}
              <Link href="/dashboard/invoices/new" className="text-brand hover:underline">
                Buat sekarang
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E2DC]">
              {invoices.map((inv) => {
                const status = statusConfig[inv.status as keyof typeof statusConfig];
                return (
                  <Link
                    key={inv.id}
                    href={`/dashboard/invoices/${inv.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F4F0] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1B19]">
                        {(inv.students as any)?.name ?? "Siswa"}
                      </p>
                      <p className="text-xs text-[#6B6860]">
                        {format(new Date(inv.due_date), "d MMM yyyy", { locale: id })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-[#1C1B19]">
                        {formatRupiah(inv.amount)}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2DC]">
            <h2 className="text-sm font-bold text-[#1C1B19]">Jadwal Hari Ini</h2>
            <Link href="/dashboard/sessions" className="text-xs text-brand font-semibold hover:underline">
              Lihat semua →
            </Link>
          </div>
          {!sessions || sessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6B6860]">
              Tidak ada sesi hari ini.{" "}
              <Link href="/dashboard/sessions/new" className="text-brand hover:underline">
                Tambah sesi
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E2DC]">
              {sessions.map((sesi) => {
                const status = sessionStatusConfig[sesi.status as keyof typeof sessionStatusConfig];
                return (
                  <div key={sesi.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="text-center w-10 flex-shrink-0">
                      <p className="text-sm font-bold font-mono text-[#1C1B19]">
                        {format(new Date(sesi.scheduled_at), "HH.mm")}
                      </p>
                      <p className="text-[10px] text-[#6B6860]">WIB</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1B19]">
                        {(sesi.students as any)?.name ?? "Siswa"}
                      </p>
                      <p className="text-xs text-brand font-medium">
                        {(sesi.students as any)?.subject}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}