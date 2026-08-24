import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-admin authentication.
 *
 * There is one password, held in ADMIN_PASSWORD and never sent to the browser.
 * A correct password mints a cookie containing an expiry timestamp plus an
 * HMAC of that timestamp, signed with AUTH_SECRET. Because the cookie is
 * signed, it cannot be forged or extended without knowing the secret.
 */

const COOKIE_NAME = "dv_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // one week

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.local");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Constant-time string comparison, safe on differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isPasswordCorrect(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to .env.local");
  }
  // Comparing HMACs rather than the raw strings keeps the comparison
  // constant-length, so it leaks nothing about the password's length.
  return safeEqual(sign(input), sign(expected));
}

export async function createSession(): Promise<void> {
  const expiresAt = String(Date.now() + SESSION_SECONDS * 1000);
  const store = await cookies();

  store.set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;

  return Number(expiresAt) > Date.now();
}
