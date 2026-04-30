import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pastikan admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("[subscription-action] admin check error:", adminError);
      return NextResponse.json(
        { error: `Gagal cek admin: ${adminError.message}` },
        { status: 500 }
      );
    }
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { subId, guruId, plan, expiresAt, action } = await request.json();

    if (!subId || !action) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    if (action === "approve") {
      // Update subscription jadi active. Pakai .select() agar tahu row terupdate atau tidak.
      const { data: updatedSub, error: subError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id,
        })
        .eq("id", subId)
        .select("id");

      if (subError) {
        console.error("[subscription-action] update sub error:", subError);
        return NextResponse.json(
          { error: `Gagal update subscription: ${subError.message}` },
          { status: 500 }
        );
      }
      if (!updatedSub || updatedSub.length === 0) {
        return NextResponse.json(
          {
            error:
              "Tidak ada baris subscription terupdate. Cek RLS policy 'Admin update subscriptions'.",
          },
          { status: 500 }
        );
      }

      // Update plan guru
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({ plan, plan_expires_at: expiresAt })
        .eq("id", guruId)
        .select("id");

      if (profileError) {
        console.error("[subscription-action] update profile error:", profileError);
        return NextResponse.json(
          { error: `Gagal update plan guru: ${profileError.message}` },
          { status: 500 }
        );
      }
      if (!updatedProfile || updatedProfile.length === 0) {
        return NextResponse.json(
          {
            error:
              "Tidak ada baris profile terupdate. Cek RLS policy 'Admin update all profiles'.",
          },
          { status: 500 }
        );
      }
    } else if (action === "reject") {
      const { data: updatedSub, error: subError } = await supabase
        .from("subscriptions")
        .update({ status: "rejected" })
        .eq("id", subId)
        .select("id");

      if (subError) {
        console.error("[subscription-action] reject error:", subError);
        return NextResponse.json(
          { error: `Gagal tolak: ${subError.message}` },
          { status: 500 }
        );
      }
      if (!updatedSub || updatedSub.length === 0) {
        return NextResponse.json(
          {
            error:
              "Tidak ada baris subscription terupdate. Cek RLS policy 'Admin update subscriptions'.",
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[subscription-action] unhandled:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}