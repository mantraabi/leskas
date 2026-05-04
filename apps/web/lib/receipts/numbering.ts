import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate receipt number unik per guru per bulan.
 * Format: KW-YYYYMM-NNNN  (contoh: KW-202611-0001)
 *
 * Strategi:
 * 1. Cari payment terakhir guru ini di bulan yang sama yang sudah punya receipt_number
 * 2. Increment counter
 * 3. Pakai service-role client (admin) untuk hindari RLS race
 */
export async function generateReceiptNumber(
  supabase: SupabaseClient,
  guruId: string,
  paidAt: string | Date
): Promise<string> {
  const date = typeof paidAt === "string" ? new Date(paidAt) : paidAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `KW-${year}${month}-`;

  // Cari semua payment guru ini bulan ini yang punya receipt_number prefix sama
  // Join via invoices.guru_id
  const { data, error } = await supabase
    .from("payments")
    .select("receipt_number, invoices!inner(guru_id)")
    .eq("invoices.guru_id", guruId)
    .like("receipt_number", `${prefix}%`)
    .order("receipt_number", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Gagal generate receipt number: ${error.message}`);
  }

  let next = 1;
  const last = data?.[0]?.receipt_number;
  if (last) {
    const m = last.match(/-(\d+)$/);
    if (m) next = parseInt(m[1] ?? "0", 10) + 1;
  }

  return `${prefix}${String(next).padStart(4, "0")}`;
}
