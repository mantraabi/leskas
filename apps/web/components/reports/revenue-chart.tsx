"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: { label: string; total: number }[];
}

function formatRupiahShort(amount: number) {
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1)} jt`;
  if (amount >= 1_000)
    return `${(amount / 1_000).toFixed(0)} rb`;
  return amount.toString();
}

export function RevenueChart({ data }: Props) {
  const maxIdx = data.reduce(
    (max, d, i) => (d.total > data[max]!.total ? i : max),
    0
  );

  return (
    <div className="bg-white rounded-xl border border-[#E4E2DC] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#E4E2DC]">
        <h2 className="text-sm font-bold text-[#1C1B19]">
          Pemasukan 6 Bulan Terakhir
        </h2>
      </div>
      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            barSize={32}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
            />
            <YAxis
              tickFormatter={formatRupiahShort}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              width={48}
            />
            <Tooltip
                formatter={(value) =>
                    new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    }).format(Number(value))
                }
              cursor={{ fill: "#F5F4F0" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E4E2DC",
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={idx === maxIdx ? "#1A6B5A" : "#D1EDE7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}