/**
 * Base URL for the Express API (e.g. http://localhost:5000/api/v1).
 * Set NEXT_PUBLIC_API_URL in .env.local — used by Next.js route handlers that proxy to the backend.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  return raw.replace(/\/$/, "");
}
