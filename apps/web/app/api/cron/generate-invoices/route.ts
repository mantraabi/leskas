import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectivePlan } from "@/lib/plan";

/**
 * Cron job harian — bikin invoice otomatis untuk siswa Business yang
 * mengaktifkan tagihan otomatis. Dipanggil oleh Vercel Cron tiap hari 00:05 WIB.
 *
 * Auth: header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Aturan:
 * - Hanya generate untuk guru dengan plan efektif "business".
 * - Cek per siswa: status = active, auto_billing_enabled = true,
 *   billing_amount > 0, billing_day diisi.
 * - Generate kalau (today_in_jakarta - billing_day) ∈ [0, 3] (grace 3 hari kalau cron sempat gagal).
 * - Skip kalau sudah ada invoice di bulan ini untuk siswa tsb.
 * - due_date = billing_day_date + 14 hari.
 */
export const dynamic = "force-dynamic";

interface StudentRow {
  id: string;
  guru_id: string;
  name: string;
  billing_amount: number;
  billing_day: number;
  profiles: { plan: string | null; plan_expires_at: string | null } | null;
}

function jakartaNow(): Date {
  // WIB = UTC+7. Kembalikan Date yang field UTC-nya = waktu Jakarta.
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const now = jakartaNow();
  const todayDay = now.getUTCDate();
  const currentMonth = now.getUTCMonth(); // 0-11
  const currentYear = now.getUTCFullYear();

  // Bulan ini: dari tanggal 1 sampai akhir bulan
  const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1)).toISOString();
  const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 1)).toISOString();

  const { data: students, error: stuErr } = await supabase
    .from("students")
    .select(
      "id, guru_id, name, billing_amount, billing_day, profiles!students_guru_id_fkey(plan, plan_expires_at)"
    )
    .eq("auto_billing_enabled", true)
    .eq("status", "active")
    .not("billing_amount", "is", null)
    .not("billing_day", "is", null)
    .returns<StudentRow[]>();

  if (stuErr) {
    console.error("[cron/generate-invoices] fetch students error:", stuErr);
    return NextResponse.json({ error: stuErr.message }, { status: 500 });
  }

  const summary = {
    candidates: students?.length ?? 0,
    eligible: 0,
    skippedNotBusiness: 0,
    skippedOutOfWindow: 0,
    skippedAlreadyExists: 0,
    created: 0,
    errors: [] as Array<{ studentId: string; message: string }>,
  };

  for (const stu of students ?? []) {
    const plan = getEffectivePlan(stu.profiles?.plan, stu.profiles?.plan_expires_at);
    if (plan !== "business") {
      summary.skippedNotBusiness++;
      continue;
    }

    // Cek window: today >= billing_day dan dalam 3 hari
    const diff = todayDay - stu.billing_day;
    if (diff < 0 || diff > 3) {
      summary.skippedOutOfWindow++;
      continue;
    }

    summary.eligible++;

    // Cek apakah sudah ada invoice "auto" untuk siswa ini di bulan berjalan
    const { count, error: countErr } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("student_id", stu.id)
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);

    if (countErr) {
      summary.errors.push({ studentId: stu.id, message: countErr.message });
      continue;
    }

    if ((count ?? 0) > 0) {
      summary.skippedAlreadyExists++;
      continue;
    }

    // Tanggal billing_day pada bulan ini (Jakarta) sebagai issue date.
    const issueDate = new Date(Date.UTC(currentYear, currentMonth, stu.billing_day));
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const { error: insErr } = await supabase.from("invoices").insert({
      guru_id: stu.guru_id,
      student_id: stu.id,
      amount: stu.billing_amount,
      due_date: dueDate.toISOString().split("T")[0],
      notes: `Tagihan otomatis ${monthStart.slice(0, 7)} — ${stu.name}`,
    });

    if (insErr) {
      summary.errors.push({ studentId: stu.id, message: insErr.message });
      continue;
    }

    summary.created++;
  }

  console.log("[cron/generate-invoices]", summary);
  return NextResponse.json(summary);
}
