/**
 * Konversi angka ke kata bahasa Indonesia.
 * Contoh: terbilang(500000) -> "lima ratus ribu"
 *         terbilang(1250000) -> "satu juta dua ratus lima puluh ribu"
 */
const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function bilang(n: number): string {
  if (n < 12) return SATUAN[n] ?? "";
  if (n < 20) return `${bilang(n - 10)} belas`;
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return `${bilang(puluh)} puluh${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `seratus${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 1000) {
    const ratus = Math.floor(n / 100);
    const sisa = n % 100;
    return `${bilang(ratus)} ratus${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `seribu${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 1_000_000) {
    const ribu = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${bilang(ribu)} ribu${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 1_000_000_000) {
    const juta = Math.floor(n / 1_000_000);
    const sisa = n % 1_000_000;
    return `${bilang(juta)} juta${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  if (n < 1_000_000_000_000) {
    const milyar = Math.floor(n / 1_000_000_000);
    const sisa = n % 1_000_000_000;
    return `${bilang(milyar)} milyar${sisa > 0 ? ` ${bilang(sisa)}` : ""}`;
  }
  // Terhitung sangat besar — fallback
  return n.toString();
}

export function terbilang(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "nol rupiah";
  const rupiah = Math.floor(amount);
  if (rupiah === 0) return "nol rupiah";
  const kata = bilang(rupiah).trim().replace(/\s+/g, " ");
  // Capitalize first letter
  const result = `${kata} rupiah`;
  return result.charAt(0).toUpperCase() + result.slice(1);
}
