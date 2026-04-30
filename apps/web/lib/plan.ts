export type Plan = "free" | "pro" | "business";

export interface PlanLimits {
  maxStudents: number; // Infinity untuk unlimited
  whatsappNotif: boolean;
  reports: boolean;
  exportPdf: boolean;
  exportCsv: boolean;
  waBlast: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxStudents: 10,
    whatsappNotif: false,
    reports: false,
    exportPdf: false,
    exportCsv: false,
    waBlast: false,
    prioritySupport: false,
  },
  pro: {
    maxStudents: Number.POSITIVE_INFINITY,
    whatsappNotif: true,
    reports: true,
    exportPdf: true,
    exportCsv: true,
    waBlast: false,
    prioritySupport: false,
  },
  business: {
    maxStudents: Number.POSITIVE_INFINITY,
    whatsappNotif: true,
    reports: true,
    exportPdf: true,
    exportCsv: true,
    waBlast: true,
    prioritySupport: true,
  },
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/**
 * Plan yang efektif dipakai user: kalau plan-nya berbayar tapi sudah lewat
 * tanggal expired, otomatis downgrade ke free. Ini mencegah user terus
 * pakai fitur premium setelah masa berlangganan habis tanpa renewal.
 */
export function getEffectivePlan(
  plan: string | null | undefined,
  expiresAt: string | null | undefined
): Plan {
  if (!plan || plan === "free") return "free";
  if (plan !== "pro" && plan !== "business") return "free";
  if (expiresAt) {
    const expiry = new Date(expiresAt);
    if (Number.isFinite(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return "free";
    }
  }
  return plan;
}

export function getLimits(
  plan: string | null | undefined,
  expiresAt: string | null | undefined
): PlanLimits {
  return PLAN_LIMITS[getEffectivePlan(plan, expiresAt)];
}

export function isPlanExpired(
  plan: string | null | undefined,
  expiresAt: string | null | undefined
): boolean {
  if (!plan || plan === "free") return false;
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  if (!Number.isFinite(expiry.getTime())) return false;
  return expiry.getTime() < Date.now();
}

/** Pesan yang konsisten untuk error gating server-side */
export function gateErrorMessage(feature: string, requiredPlan: Plan = "pro") {
  return `Fitur "${feature}" hanya tersedia di paket ${PLAN_LABELS[requiredPlan]}. Upgrade di /dashboard/settings.`;
}
