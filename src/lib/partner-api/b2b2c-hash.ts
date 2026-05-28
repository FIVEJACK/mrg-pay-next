// SSR-only: importing `server-only` makes the bundler crash the build if
// this module is pulled into a client component, keeping the AES key off
// the browser.
import "server-only";

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export type B2b2cHashPayload = {
  partner_id: number;
  game_id: number;
  item_type_id: number;
  currency: string;
  country_code: string;
};

function getHashSecret(): string {
  const secret = process.env.B2B2C_HASH_CODE;
  if (!secret) {
    throw new Error(
      "B2B2C_HASH_CODE is not set — cannot decode the b2b2c hash without the AES key.",
    );
  }
  return secret;
}

function deriveKey(secret: string): Buffer {
  // 32-byte key for AES-256. Matches the gateway's `deriveKey(secret)` —
  // swap this implementation if the gateway uses a different KDF (scrypt,
  // PBKDF2, or a raw-hex key passed straight through).
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

/**
 * Decode an `x-api-key` b2b2c hash into its scope payload. The hash is the
 * hex encoding of `iv | auth_tag | ciphertext`, AES-256-GCM.
 *
 * Throws if the env var is missing, the hash is malformed, or the auth tag
 * doesn't verify.
 */
export function decodeB2b2cHash(hash: string): B2b2cHashPayload {
  const key = deriveKey(getHashSecret());
  const combined = Buffer.from(hash, "hex");
  if (combined.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("b2b2c hash is too short");
  }
  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return JSON.parse(decrypted.toString("utf8")) as B2b2cHashPayload;
}

/**
 * `decodeB2b2cHash` wrapped in a try/catch — returns `null` on any failure
 * (missing env, malformed hash, bad auth tag). Useful in SSR pages that want
 * to render an error state instead of crashing the route.
 */
export function tryDecodeB2b2cHash(hash: string): B2b2cHashPayload | null {
  try {
    return decodeB2b2cHash(hash);
  } catch (err) {
    console.warn(
      `[b2b2c-hash] decode failed: ${(err as Error).message ?? String(err)}`,
    );
    return null;
  }
}
