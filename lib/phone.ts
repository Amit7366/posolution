/** Normalize BD mobile to E.164: +8801XXXXXXXXX */
export function normalizeBdPhone(input: string): string {
  const digits = String(input || "").replace(/\D/g, "");

  let national = digits;
  if (national.startsWith("880")) {
    national = national.slice(3);
  }
  if (national.startsWith("0")) {
    national = national.slice(1);
  }

  return `+880${national}`;
}

/** Valid BD mobile after +880: 10 digits starting with 1 */
export function isValidBdPhone(input: string): boolean {
  const normalized = normalizeBdPhone(input);
  return /^\+8801\d{9}$/.test(normalized);
}

/** Strip +880 / leading 0 for the local input field */
export function toBdLocalPhoneInput(input: string): string {
  const digits = String(input || "").replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("880")) national = national.slice(3);
  if (national.startsWith("0")) national = national.slice(1);
  return national.slice(0, 10);
}
