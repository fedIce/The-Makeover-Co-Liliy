import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

function keyFromSecret(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be set (min 16 chars)");
  }
  return scryptSync(secret, "makeover-co-salt", 32);
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", keyFromSecret(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
