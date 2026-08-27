import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const BRAND = {
  blue: "#004AF2",
  blueBright: "#0051FC",
  blueDeep: "#0043CD",
  cyan: "#01A7BC",
  teal: "#03837F",
  green: "#04C609",
  lime: "#2AE562",
  emerald: "#02C64F",
  leaf: "#016256",
  navy: "#061433",
  mist: "#F3F7FF",
  white: "#FFFFFF",
} as const;

export async function getBrandIconDataUri() {
  const buf = await readFile(join(process.cwd(), "public/posulation-icon.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
