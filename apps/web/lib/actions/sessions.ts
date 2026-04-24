"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSessionStatus(
  id: string,
  status: "scheduled" | "done" | "cancelled"
) {
  const supabase = await createClient();
  await supabase.from("sessions").update({ status }).eq("id", id);
  revalidatePath("/dashboard/sessions");
}