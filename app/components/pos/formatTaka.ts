export function formatTaka(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function todayDueDate(): string {
  return new Date().toISOString().slice(0, 10);
}
