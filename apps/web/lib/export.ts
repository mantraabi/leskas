import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface LaporanRow {
  siswa: string;
  jumlah: number;
  dibayar: number;
  sisa: number;
  status: string;
  jatuhTempo: string;
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// Export Excel pakai format CSV yang bisa dibuka Excel
export function exportToExcel(data: LaporanRow[], filename: string) {
  const headers = [
    "Siswa",
    "Total Tagihan",
    "Sudah Dibayar",
    "Sisa Tagihan",
    "Status",
    "Jatuh Tempo",
  ];

  const rows = data.map((r) => [
    r.siswa,
    r.jumlah,
    r.dibayar,
    r.sisa,
    r.status,
    r.jatuhTempo,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const BOM = "\uFEFF"; // supaya Excel baca UTF-8 dengan benar
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}.csv`);
}

// Export PDF pakai HTML → print
export function exportToPDF(
  data: LaporanRow[],
  filename: string,
  title: string
) {
  const tanggalCetak = format(new Date(), "d MMMM yyyy", { locale: id });

  const rows = data
    .map(
      (r) => `
      <tr>
        <td>${r.siswa}</td>
        <td>${formatRupiah(r.jumlah)}</td>
        <td>${formatRupiah(r.dibayar)}</td>
        <td>${formatRupiah(r.sisa)}</td>
        <td><span class="status status-${r.status.toLowerCase().replace(" ", "-")}">${r.status}</span></td>
        <td>${r.jatuhTempo}</td>
      </tr>`
    )
    .join("");

  const totalTagihan = data.reduce((s, r) => s + r.jumlah, 0);
  const totalDibayar = data.reduce((s, r) => s + r.dibayar, 0);
  const totalSisa = data.reduce((s, r) => s + r.sisa, 0);

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1C1B19; padding: 32px; }
        .header { margin-bottom: 24px; }
        .logo { font-size: 20px; font-weight: 700; color: #1A6B5A; }
        .title { font-size: 14px; font-weight: 600; margin-top: 4px; }
        .date { font-size: 11px; color: #6B6860; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #1A6B5A; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
        td { padding: 8px 12px; border-bottom: 1px solid #E4E2DC; font-size: 11px; }
        tr:nth-child(even) td { background: #F5F4F0; }
        .total-row td { font-weight: 700; background: #E6F5F1; border-top: 2px solid #1A6B5A; }
        .status { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .status-lunas { background: #E6F5F1; color: #1A6B5A; }
        .status-belum-bayar { background: #FFF4E0; color: #B86E00; }
        .status-terlambat { background: #FDECEA; color: #C0392B; }
        .status-sebagian { background: #EAF1FB; color: #1A4F8A; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">LesKas</div>
        <div class="title">${title}</div>
        <div class="date">Dicetak: ${tanggalCetak}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Siswa</th>
            <th>Total Tagihan</th>
            <th>Sudah Dibayar</th>
            <th>Sisa</th>
            <th>Status</th>
            <th>Jatuh Tempo</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${formatRupiah(totalTagihan)}</td>
            <td>${formatRupiah(totalDibayar)}</td>
            <td>${formatRupiah(totalSisa)}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}