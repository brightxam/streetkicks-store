import { requireAdmin } from "@/lib/requireAdmin";
import { ensureSchema } from "@/lib/schema";
import { listProducts, createProduct } from "@/lib/products";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    await ensureSchema();
    if (req.method === "GET") {
      const products = await listProducts();
      return res.status(200).json({ products });
    }
    if (req.method === "POST") {
      const product = await createProduct(req.body || {});
      return res.status(201).json({ product });
    }
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("admin/products error:", err);
    return res.status(500).json({ error: "Failed to process products request" });
  }
}
