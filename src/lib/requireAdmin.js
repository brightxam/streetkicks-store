import { isValidSessionCookie } from "./adminAuth";

// Call at the top of any admin API route: `if (!requireAdmin(req, res)) return;`
export function requireAdmin(req, res) {
  if (!isValidSessionCookie(req.headers.cookie)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
