import crypto from "crypto";

/**
 * AES-256-ECB encryption (PKCS7 padding) + Base64 output
 * Equivalent to:
 *   openssl_encrypt($data, 'AES-256-ECB', $keyBin, OPENSSL_RAW_DATA)
 */
export function encryptAES256ECB(data: string, key: string): string {
  let keyBin: Buffer;

  // Convert 64-hex key → binary, otherwise pad/truncate ASCII key to 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    keyBin = Buffer.from(key, "hex");
  } else {
    const buf = Buffer.alloc(32);
    const inputBuf = Buffer.from(key, "utf8");
    inputBuf.copy(buf, 0, 0, Math.min(inputBuf.length, 32));
    keyBin = buf;
  }

  if (keyBin.length !== 32) {
    throw new Error("AES key must be 32 bytes");
  }

  // AES-256-ECB encryption
  const cipher = crypto.createCipheriv("aes-256-ecb", keyBin, null);
  cipher.setAutoPadding(true);

  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);

  return encrypted.toString("base64");
}
