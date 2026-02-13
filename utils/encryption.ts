import crypto from "crypto";

/**
 * Ensure 32-byte AES key.
 * - If 64-char hex → convert to binary (32 bytes)
 * - Else: ASCII padded/truncated to 32 bytes
 */
export function makeAes256Key(keyRaw: string): Buffer {
  if (/^[0-9a-fA-F]{64}$/.test(keyRaw)) {
    // 64 hex chars → 32 bytes
    return Buffer.from(keyRaw, "hex");
  }

  // ASCII fallback
  const buf = Buffer.alloc(32);
  const inputBuf = Buffer.from(keyRaw, "utf8");
  inputBuf.copy(buf, 0, 0, Math.min(inputBuf.length, 32));
  return buf;
}

/**
 * AES-256-ECB encryption (PKCS7 padding) + Base64 output
 * Mirrors PHP's openssl_encrypt(..., 'AES-256-ECB', ..., OPENSSL_RAW_DATA)
 */
export function encryptPayload(data: Record<string, any>, aesKeyRaw: string): string {
  const key = makeAes256Key(aesKeyRaw);
  const plaintext = JSON.stringify(data);

  const cipher = crypto.createCipheriv("aes-256-ecb", key, null);
  cipher.setAutoPadding(true);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return encrypted.toString("base64");
}
