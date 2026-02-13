// utils/helpers.ts

/** Get UTC ISO timestamp without milliseconds (matches PHP format) */
export function getIsoTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Detect platform: 1 = Web, 2 = Mobile */
export function getPlatform(): string {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "2" : "1";
}

/** Generate numeric transfer ID */
export function generateTransferId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000000000).toString();
}
