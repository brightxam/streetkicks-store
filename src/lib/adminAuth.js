import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "sk_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function createSessionToken() {
  return crypto
    .createHmac("sha256", getSecret())
    .update("streetkicks-admin-session")
    .digest("hex");
}

export function verifyPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function getSessionToken() {
  return createSessionToken();
}

// Minimal cookie serializer (avoids depending on the "cookie" package, whose
// v2 release ships as ESM-only and doesn't interop reliably with Next's
// serverless function bundling).
export function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.sameSite) {
    const s = options.sameSite;
    parts.push(`SameSite=${s.charAt(0).toUpperCase()}${s.slice(1)}`);
  }
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

export function isValidSessionCookie(cookieHeader) {
  const cookies = parseCookies(cookieHeader);
  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
