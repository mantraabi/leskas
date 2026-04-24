import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/duitku";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    merchantCode,
    amount,
    merchantOrderId,
    resultCode,
    signature,
  } = body;

  // Verifikasi signature
  const isValid = verifyWebhookSignature(
    merchantCode,
    amount,
    merchantOrderId,
    process.env.DUITKU_API_KEY!,
    signature
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // resultCode "00" = sukses
  if (resultCode !== "00") {
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .like("notes", `%${merchantOrderId}%`);

  if (!invoices || invoices.length === 0) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  const invoice = invoices[0]!;

  await supabase.from("payments").insert({
    invoice_id: invoice.id,
    amount: parseFloat(amount),
    method: "midtrans", // kita reuse kolom ini, nilainya tetap valid
  });

  return NextResponse.json({ received: true });
}