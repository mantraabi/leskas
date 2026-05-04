"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const COOKIE_NAME = "selected_branch";

export async function selectBranch(branchId: string | null) {
  const cookieStore = await cookies();
  if (!branchId || branchId === "all") {
    cookieStore.delete(COOKIE_NAME);
  } else {
    cookieStore.set(COOKIE_NAME, branchId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  revalidatePath("/dashboard", "layout");
}

export async function getSelectedBranch(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
