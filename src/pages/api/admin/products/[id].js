import { requireAdmin } from "@/lib/requireAdmin";
import { ensureSchema } from "@/lib/schema";
import { updateProduct, deleteProduct } from "@/lib/products";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const { id } = req.query;
  try {
    await ensureSchema();
    if (req.method === "PUT") {
      const product = await updateProduct(id, req.body || {});
      if (!product) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ product });
    }
    if (req.method === "DELETE") {
      await deleteProduct(id);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("admin/products/[id] error:", err);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
