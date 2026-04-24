function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  data: { name: string; total: number }[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const colors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-purple-100 text-purple-700",
];

export function TopStudents({ data }: Props) {
  const maxTotal = data[0]?.total ?? 1;

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
        <h2 className="text-sm font-bold text-[#1C1B19]">
          Top Siswa (Tagihan Lunas)
        </h2>
      </div>
      <div className="p-5 flex flex-col gap-4">
        {data.length === 0 ? (
          <p className="text-sm text-[#6B6860] text-center py-6">
            Belum ada data pembayaran.
          </p>
        ) : (
          data.map((student, idx) => (
            <div key={student.name} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  colors[idx % colors.length]
                }`}
              >
                {getInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#1C1B19] truncate">
                    {student.name}
                  </p>
                  <p className="text-xs font-mono font-bold text-brand ml-2 flex-shrink-0">
                    {formatRupiah(student.total)}
                  </p>
                </div>
                <div className="w-full bg-[#F0EEE9] rounded-full h-1.5">
                  <div
                    className="bg-brand h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(student.total / maxTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}