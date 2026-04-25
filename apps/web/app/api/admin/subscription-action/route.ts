import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pastikan admin
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subId, guruId, plan, expiresAt, action } = await request.json();

  if (action === "approve") {
    // Update subscription jadi active
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .eq("id", subId);

    // Update plan guru
    await supabase
      .from("profiles")
      .update({
        plan,
        plan_expires_at: expiresAt,
      })
      .eq("id", guruId);

  } else {
    // Tolak
    await supabase
      .from("subscriptions")
      .update({ status: "rejected" })
      .eq("id", subId);
  }

  return NextResponse.json({ success: true });
}