import { isValidSessionCookie } from "@/lib/adminAuth";

// Lightweight check used by admin pages to decide whether to show the
// login form or the dashboard, without triggering a DB query.
export default async function handler(req, res) {
  const valid = isValidSessionCookie(req.headers.cookie);
  return res.status(200).json({ authenticated: valid });
}
