import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/requireAdmin";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { filename, dataBase64, contentType } = req.body || {};
  if (!filename || !dataBase64) {
    return res.status(400).json({ error: "Missing file data" });
  }
  try {
    const buffer = Buffer.from(dataBase64, "base64");
    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`products/${Date.now()}-${safeName}`, buffer, {
      access: "public",
      contentType: contentType || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("upload-image error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
