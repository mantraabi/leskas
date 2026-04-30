import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import {
  sendWhatsApp,
  templateTagihanBaru,
  templateReminder,
  templateTerlambat,
} from "../../../lib/fonnte";
import { getLimits, gateErrorMessage } from "../../../lib/plan";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gate: WhatsApp notif hanya untuk Pro/Business (active)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);
  if (!limits.whatsappNotif) {
    return NextResponse.json(
      { error: gateErrorMessage("Notifikasi WhatsApp", "pro") },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { invoiceId, phone, namaOrtu, namaSiswa, nominal, jatuhTempo, type } = body;

  if (!phone || !namaSiswa || !nominal) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  let message = "";

  if (type === "new") {
    message = templateTagihanBaru(namaOrtu, namaSiswa, nominal, jatuhTempo);
  } else if (type === "overdue") {
    message = templateTerlambat(namaOrtu, namaSiswa, nominal);
  } else {
    message = templateReminder(namaOrtu, namaSiswa, nominal, 3);
  }

  const result = await sendWhatsApp(phone, message);

  if (!result.status) {
    return NextResponse.json(
      { error: "Gagal kirim WA. Cek token Fonnte." },
      { status: 500 }
    );
  }

  // Catat ke tabel notifications
  await supabase.from("notifications").insert({
    invoice_id: invoiceId,
    type: type === "new" ? "new_invoice" : type === "overdue" ? "overdue" : "reminder",
    channel: "wa",
    status: "sent",
  });

  return NextResponse.json({ success: true });
}