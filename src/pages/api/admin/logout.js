import { ADMIN_COOKIE_NAME, serializeCookie } from "@/lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader(
    "Set-Cookie",
    serializeCookie(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
  return res.status(200).json({ ok: true });
}
