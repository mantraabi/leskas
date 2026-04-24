import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayment, generateOrderId } from "@/lib/duitku";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = await request.json();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, students(name, parent_name, parent_phone)")
    .eq("id", invoiceId)
    .eq("guru_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Tagihan sudah lunas." }, { status: 400 });
  }

  const sisaTagihan = invoice.amount - invoice.amount_paid;
  const orderId = generateOrderId(invoiceId);
  const student = invoice.students as any;

  let result;
  try {
    result = await createPayment({
      merchantOrderId: orderId,
      paymentAmount: sisaTagihan,
      productDetails: `Les - ${student?.name ?? "Siswa"}`,
      customerName: student?.parent_name ?? student?.name ?? "Ortu",
      email: user.email!,
      phoneNumber: student?.parent_phone ?? "",
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoiceId}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
    });
    console.log("Duitku result:", result);
  } catch (err) {
    console.log("Duitku error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  if (!result?.paymentUrl) {
    return NextResponse.json(
      { error: `Duitku: ${result?.message ?? "Gagal membuat link pembayaran."}` },
      { status: 500 }
    );
  }

  await supabase
    .from("invoices")
    .update({
      notes: invoice.notes
        ? `${invoice.notes} | order:${orderId}`
        : `order:${orderId}`,
    })
    .eq("id", invoiceId);

  return NextResponse.json({ paymentUrl: result.paymentUrl });
}