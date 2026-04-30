import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { Plan } from "@/lib/plan";
import { PLAN_LABELS } from "@/lib/plan";

interface Props {
  title: string;
  description: string;
  requiredPlan?: Plan;
  /** "card" = inline kotak; "screen" = full-page lock state */
  variant?: "card" | "screen";
}

export function UpgradePrompt({
  title,
  description,
  requiredPlan = "pro",
  variant = "card",
}: Props) {
  if (variant === "screen") {
    return (
      <div className="bg-white rounded-2xl border border-[#E4E2DC] py-16 px-6 flex flex-col items-center text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
          <Sparkles size={26} />
        </div>
        <h2 className="text-lg font-bold text-[#1C1B19]">{title}</h2>
        <p className="text-sm text-[#6B6860] mt-1.5 max-w-sm">{description}</p>
        <Link
          href="/dashboard/settings"
          className="mt-5 inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Sparkles size={14} />
          Upgrade ke {PLAN_LABELS[requiredPlan]}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
        <Lock size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">{title}</p>
        <p className="text-xs text-amber-700 mt-0.5">{description}</p>
      </div>
      <Link
        href="/dashboard/settings"
        className="text-xs font-semibold text-brand hover:underline flex-shrink-0 self-center"
      >
        Upgrade →
      </Link>
    </div>
  );
}
