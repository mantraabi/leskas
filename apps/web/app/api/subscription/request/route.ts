import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addMonths } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const plan = formData.get("plan") as string | null;

    if (!file || !plan) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    if (!["pro", "business"].includes(plan)) {
      return NextResponse.json({ error: "Plan tidak valid." }, { status: 400 });
    }

    // Validasi tipe & ukuran file (max 5 MB)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar." },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB." },
        { status: 400 }
      );
    }

    // Upload bukti ke Supabase Storage
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
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
      console.error("[subscription/request] upload error:", uploadError);
      return NextResponse.json(
        { error: `Gagal upload bukti: ${uploadError.message}` },
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
      console.error("[subscription/request] insert error:", subError);
      return NextResponse.json(
        { error: `Gagal menyimpan data: ${subError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[subscription/request] unhandled:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}