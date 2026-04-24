import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RevenueChart } from "../../../components/reports/revenue-chart";
import { TopStudents } from "../../../components/reports/top-students";
import { MonthlySummary } from "@/components/reports/monthly-summary";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";
import { id } from "date-fns/locale";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const now = new Date();

  // Ambil data 6 bulan terakhir
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    return {
      label: format(date, "MMM", { locale: id }),
      start: startOfMonth(date).toISOString(),
      end: endOfMonth(date).toISOString(),
    };
  });

  // Ambil semua payments + invoices bulan ini
  const bulanIniStart = startOfMonth(now).toISOString();
  const bulanIniEnd = endOfMonth(now).toISOString();

  const [
    { data: allPayments },
    { data: invoices },
    { data: students },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount, paid_at, invoices!inner(guru_id)")
      .eq("invoices.guru_id", user.id),
    supabase
      .from("invoices")
      .select("*, students(name)")
      .eq("guru_id", user.id),
    supabase
      .from("students")
      .select("id, name")
      .eq("guru_id", user.id)
      .eq("status", "active"),
  ]);

  // Hitung pemasukan per bulan
  const revenueData = months.map(({ label, start, end }) => {
    const total = allPayments
      ?.filter((p) => p.paid_at >= start && p.paid_at <= end)
      .reduce((sum, p) => sum + p.amount, 0) ?? 0;
    return { label, total };
  });

  // Hitung total per siswa
  const studentRevenue = students?.map((s) => {
    const total = invoices
      ?.filter((inv) => (inv.students as any)?.name === s.name && inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0) ?? 0;
    return { name: s.name, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5) ?? [];

  // Summary bulan ini
  const pemasukanBulanIni = allPayments
    ?.filter((p) => p.paid_at >= bulanIniStart && p.paid_at <= bulanIniEnd)
    .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const totalTagihan = invoices?.length ?? 0;
  const tagihanLunas = invoices?.filter((inv) => inv.status === "paid").length ?? 0;
  const tagihanBelumBayar = invoices?.filter(
    (inv) => inv.status === "unpaid" || inv.status === "overdue"
  ).length ?? 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-[#1C1B19]">Laporan</h1>
        <p className="text-sm text-[#6B6860] mt-0.5 capitalize">
          {format(now, "MMMM yyyy", { locale: id })}
        </p>
      </div>

      <MonthlySummary
        pemasukanBulanIni={pemasukanBulanIni}
        totalTagihan={totalTagihan}
        tagihanLunas={tagihanLunas}
        tagihanBelumBayar={tagihanBelumBayar}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RevenueChart data={revenueData} />
        <TopStudents data={studentRevenue} />
      </div>
    </div>
  );
}