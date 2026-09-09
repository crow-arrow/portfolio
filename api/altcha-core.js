import { createChallenge, randomInt } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { deriveHmacKeySecret, verify } from "altcha-lib/frameworks/shared";

const DEV_HMAC_FALLBACK = "dev-only-altcha-hmac-key";
const CHALLENGE_TTL_MS = 10 * 60 * 1000;

let hmacKeySignatureSecretPromise;

function isProduction() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function getHmacSignatureSecret() {
  if (process.env.ALTCHA_HMAC_KEY) {
    return process.env.ALTCHA_HMAC_KEY;
  }

  if (!isProduction()) {
    return DEV_HMAC_FALLBACK;
  }

  return "";
}

async function getSecrets() {
  const hmacSignatureSecret = getHmacSignatureSecret();
  if (!hmacSignatureSecret) {
    throw new Error("ALTCHA_HMAC_KEY is not configured");
  }

  if (!hmacKeySignatureSecretPromise) {
    hmacKeySignatureSecretPromise = deriveHmacKeySecret(hmacSignatureSecret);
  }

  return {
    hmacSignatureSecret,
    hmacKeySignatureSecret: await hmacKeySignatureSecretPromise,
  };
}

export async function createAltchaChallenge() {
  const { hmacSignatureSecret, hmacKeySignatureSecret } = await getSecrets();

  return createChallenge({
    algorithm: "PBKDF2/SHA-256",
    cost: 5_000,
    counter: randomInt(5_000, 10_000),
    deriveKey,
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    hmacSignatureSecret,
    hmacKeySignatureSecret,
  });
}

export async function verifyAltchaPayload(payload) {
  const { hmacSignatureSecret, hmacKeySignatureSecret } = await getSecrets();

  return verify(
    payload,
    deriveKey,
    hmacSignatureSecret,
    hmacKeySignatureSecret
  );
}
