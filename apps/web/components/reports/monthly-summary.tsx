function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  pemasukanBulanIni: number;
  totalTagihan: number;
  tagihanLunas: number;
  tagihanBelumBayar: number;
}

export function MonthlySummary({
  pemasukanBulanIni,
  totalTagihan,
  tagihanLunas,
  tagihanBelumBayar,
}: Props) {
  const persentaseLunas = totalTagihan > 0
    ? Math.round((tagihanLunas / totalTagihan) * 100)
    : 0;

  const stats = [
    {
      label: "Pemasukan Bulan Ini",
      value: formatRupiah(pemasukanBulanIni),
      highlight: true,
    },
    {
      label: "Total Tagihan",
      value: totalTagihan.toString(),
      highlight: false,
    },
    {
      label: "Tingkat Koleksi",
      value: `${persentaseLunas}%`,
      highlight: false,
    },
    {
      label: "Belum Dibayar",
      value: tagihanBelumBayar.toString(),
      warning: tagihanBelumBayar > 0,
    },
  ];

  return (
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
            stat.highlight
              ? "text-brand"
              : stat.warning
              ? "text-amber-700"
              : "text-[#1C1B19]"
          }`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}