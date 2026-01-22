export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const ones = [
  "Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
  "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen",
];
const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function chunkToWords(n: number): string {
  let s: string[] = [];
  if (n >= 100) {
    s.push(ones[Math.floor(n / 100)], "Hundred");
    n = n % 100;
  }
  if (n >= 20) {
    s.push(tens[Math.floor(n / 10)]);
    n = n % 10;
    if (n) s.push(ones[n]);
  } else if (n > 0) {
    s.push(ones[n]);
  }
  return s.join(" ");
}

export function numberToWordsUSD(amount: number) {
  const n = Math.floor(amount);
  if (n === 0) return "Dollar Zero";

  const parts: string[] = [];

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  if (billions) parts.push(chunkToWords(billions), "Billion");
  if (millions) parts.push(chunkToWords(millions), "Million");
  if (thousands) parts.push(chunkToWords(thousands), "Thousand");
  if (remainder) parts.push(chunkToWords(remainder));

  return `Dollar ${parts.join(" ")}`.replace(/\s+/g, " ").trim();
}
