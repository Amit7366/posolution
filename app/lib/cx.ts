export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function formatMoney(n: number) {
  return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

export function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
