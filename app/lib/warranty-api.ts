import type { Warranty, WarrantyPeriod } from "@/app/types/warranty";

export type ApiPeriod = "day" | "week" | "month" | "year";

const PERIOD_UI: Record<ApiPeriod, WarrantyPeriod> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

const PERIOD_API: Record<WarrantyPeriod, ApiPeriod> = {
  Day: "day",
  Week: "week",
  Month: "month",
  Year: "year",
};

export function uiPeriodToApi(p: WarrantyPeriod): ApiPeriod {
  return PERIOD_API[p];
}

export function apiDocToWarranty(doc: Record<string, unknown>): Warranty {
  const rawId = doc._id;
  const id =
    typeof rawId === "object" && rawId !== null && "toString" in rawId
      ? String((rawId as { toString(): string }).toString())
      : String(rawId ?? "");

  const p = String(doc.period ?? "month").toLowerCase() as ApiPeriod;
  const period = PERIOD_UI[p] ?? "Month";
  const status: Warranty["status"] = doc.status === "inactive" ? "Inactive" : "Active";

  let createdAt = "";
  if (doc.createdAt != null) {
    const d = doc.createdAt;
    if (d instanceof Date) createdAt = d.toISOString().slice(0, 10);
    else createdAt = String(d).slice(0, 10);
  }

  return {
    id,
    name: String(doc.name ?? ""),
    description: String(doc.description ?? ""),
    duration: Number(doc.duration) || 0,
    period,
    createdAt,
    status,
  };
}

export function warrantyLabel(w: Pick<Warranty, "duration" | "period">): string {
  const unit = w.period.toLowerCase() + (w.duration === 1 ? "" : "s");
  return `${w.duration} ${unit}`;
}
