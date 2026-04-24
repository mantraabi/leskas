import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayment, generateOrderId } from "@/lib/duitku";
import { addMonths } from "date-fns";

const planNames: Record<string, string> = {
  pro: "LesKas Pro - 1 Bulan",
  business: "LesKas Business - 1 Bulan",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, amount } = await request.json();

  if (!plan || !amount) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone")
    .eq("id", user.id)
    .single();

  const orderId = generateOrderId(user.id);
  const expiresAt = addMonths(new Date(), 1);

  // Simpan subscription pending
  await supabase.from("subscriptions").insert({
    guru_id: user.id,
    plan,
    amount,
    expires_at: expiresAt.toISOString(),
    order_id: orderId,
    status: "pending",
  });

  const result = await createPayment({
    merchantOrderId: orderId,
    paymentAmount: amount,
    productDetails: planNames[plan] ?? `LesKas ${plan}`,
    customerName: profile?.name ?? "Guru",
    customerPhone: profile?.phone ?? "",
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/webhook`,
  });

  if (!result.paymentUrl) {
    return NextResponse.json(
      { error: "Gagal membuat link pembayaran." },
      { status: 500 }
    );
  }

  return NextResponse.json({ paymentUrl: result.paymentUrl });
}