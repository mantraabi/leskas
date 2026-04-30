import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addMonths } from "date-fns";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const plan = formData.get("plan") as string;

  if (!file || !plan) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  // Upload bukti ke Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `proof-${user.id}-${Date.now()}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(`proofs/${fileName}`, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Gagal upload bukti." },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("assets")
    .getPublicUrl(`proofs/${fileName}`);

  const proofUrl = urlData.publicUrl;
  const amount = plan === "pro" ? 49000 : 129000;
  const expiresAt = addMonths(new Date(), 1);

  // Simpan subscription dengan status pending
  const { error: subError } = await supabase
    .from("subscriptions")
    .insert({
      guru_id: user.id,
      plan,
      amount,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      proof_url: proofUrl,
    });

  if (subError) {
    return NextResponse.json(
      { error: "Gagal menyimpan data." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}