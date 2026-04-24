import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/duitku";
import { addMonths } from "date-fns";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { merchantCode, amount, merchantOrderId, resultCode, signature } = body;

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

  if (resultCode !== "00") {
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();

  // Cari subscription berdasarkan order_id
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("order_id", merchantOrderId)
    .single();

  if (!subscription) {
    return NextResponse.json({ error: "Subscription tidak ditemukan." }, { status: 404 });
  }

  const expiresAt = addMonths(new Date(), 1);

  // Update subscription jadi aktif
  await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("order_id", merchantOrderId);

  // Update plan di profile guru
  await supabase
    .from("profiles")
    .update({
      plan: subscription.plan,
      plan_expires_at: expiresAt.toISOString(),
    })
    .eq("id", subscription.guru_id);

  return NextResponse.json({ received: true });
}