import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM box for per-user provider keys. The encryption key lives in
 * `SECRETS_ENCRYPTION_KEY` (Vercel / .env.local). Ciphertext is stored in
 * Postgres; plaintext never leaves Route Handlers.
 */

const PREFIX = "v1";

function keyBytes(): Buffer {
  const secret =
    process.env.SECRETS_ENCRYPTION_KEY?.trim() || "honza-dev-unconfigured-do-not-use-in-prod";
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(
    ".",
  );
}

export function decryptSecret(boxed: string): string {
  const [prefix, ivB64, tagB64, dataB64] = boxed.split(".");
  if (prefix !== PREFIX || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Unrecognized secret box.");
  }
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
