import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReceiptPDF, type ReceiptData } from "@/lib/receipts/receipt-pdf";
import { generateReceiptNumber } from "@/lib/receipts/numbering";
import { getLimits } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ paymentId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { paymentId } = await params;
  const url = new URL(request.url);
  // Token-based access (parent portal) — optional
  const portalToken = url.searchParams.get("token");

  // Pakai admin client untuk akses portal (bypass RLS dengan validasi token),
  // atau client biasa untuk akses dashboard (tetap dengan RLS).
  const supabase = portalToken ? createAdminClient() : await createClient();

  // 1. Ambil payment + invoice + student
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select(
      `id, amount, paid_at, method, receipt_number,
       invoices!inner(
         id, guru_id, due_date, notes,
         students!inner(id, name, subject, parent_name, branch_id, portal_token)
       )`
    )
    .eq("id", paymentId)
    .single();

  if (payErr || !payment) {
    console.error("[receipt-pdf] payment lookup failed", { paymentId, error: payErr });
    return NextResponse.json(
      {
        error: "Pembayaran tidak ditemukan",
        detail: payErr?.message ?? null,
      },
      { status: 404 }
    );
  }

  // Supabase ngembalikan join sebagai object kalau !inner, tapi typenya bisa array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoice = (Array.isArray(payment.invoices) ? payment.invoices[0] : payment.invoices) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const student = (Array.isArray(invoice?.students) ? invoice.students[0] : invoice?.students) as any;

  if (!invoice || !student) {
    return NextResponse.json({ error: "Data tagihan/siswa tidak lengkap" }, { status: 404 });
  }

  // 2. Authorization — guru pemilik (cookie auth) atau parent portal token cocok
  let isOwner = false;
  if (!portalToken) {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    isOwner = user?.id === invoice.guru_id;
  }
  const isPortalAccess = Boolean(
    portalToken && student.portal_token && portalToken === student.portal_token
  );

  if (!isOwner && !isPortalAccess) {
    return NextResponse.json({ error: "Tidak berwenang" }, { status: 403 });
  }

  // 3. Cek plan guru — gating PDF
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone, plan, plan_expires_at, brand_logo_url, brand_color")
    .eq("id", invoice.guru_id)
    .single();

  const limits = getLimits(profile?.plan, profile?.plan_expires_at);
  if (!limits.pdfReceipt) {
    return NextResponse.json(
      { error: "Kwitansi PDF hanya tersedia untuk paket Pro & Business" },
      { status: 403 }
    );
  }

  // 4. Generate atau ambil receipt_number
  let receiptNumber = payment.receipt_number;
  if (!receiptNumber) {
    receiptNumber = await generateReceiptNumber(
      supabase,
      invoice.guru_id,
      payment.paid_at
    );
    // Cache di DB — kalau gagal, lanjut tetap (best-effort)
    await supabase
      .from("payments")
      .update({ receipt_number: receiptNumber })
      .eq("id", payment.id);
  }

  // 5. Ambil cabang kalau ada
  let branchName: string | null = null;
  let branchAddress: string | null = null;
  if (student.branch_id) {
    const { data: branch } = await supabase
      .from("branches")
      .select("name, address")
      .eq("id", student.branch_id)
      .single();
    branchName = branch?.name ?? null;
    branchAddress = branch?.address ?? null;
  }

  // 6. Build PDF data
  const branded = limits.brandedReceipt;
  const data: ReceiptData = {
    receiptNumber,
    paidAt: payment.paid_at,
    amount: payment.amount,
    studentName: student.name,
    parentName: student.parent_name,
    subject: student.subject,
    invoiceNumber: null,
    invoiceDueDate: invoice.due_date,
    invoiceNotes: invoice.notes,
    paymentMethod: payment.method ?? null,
    guruName: profile?.name ?? "Guru Les",
    guruPhone: profile?.phone ?? null,
    brandLogoUrl: branded ? profile?.brand_logo_url ?? null : null,
    brandColor: branded ? profile?.brand_color ?? null : null,
    branchName,
    branchAddress,
  };

  // 7. Render PDF
  try {
    const stream = await renderToStream(<ReceiptPDF data={data} branded={branded} />);
    // Convert Node Readable -> Web ReadableStream untuk Response body
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Kwitansi-${receiptNumber}.pdf"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[receipt-pdf] render error", err);
    return NextResponse.json(
      { error: "Gagal generate PDF kwitansi" },
      { status: 500 }
    );
  }
}
