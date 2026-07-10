import {
  verifyPassword,
  getSessionToken,
  ADMIN_COOKIE_NAME,
  serializeCookie,
} from "@/lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: "Неверный пароль" });
  }
  const token = getSessionToken();
  res.setHeader(
    "Set-Cookie",
    serializeCookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  );
  return res.status(200).json({ ok: true });
}
