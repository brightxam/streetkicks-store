import { ensureSchema } from "@/lib/schema";
import { listProducts } from "@/lib/products";
import { formatRub } from "@/lib/currency";

// Public, read-only endpoint the storefront fetches at runtime so admin
// edits (price, image, catalog changes) show up without a redeploy.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    await ensureSchema();
    const products = await listProducts();
    const shoes = products.map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      primary_color: p.primary_color,
      primary_color_hex: p.primary_color_hex,
      price: p.price_rub != null ? formatRub(p.price_rub) : null,
      price_rub: p.price_rub,
      image_url: p.image_url,
      product_url: p.product_url,
    }));
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    return res.status(200).json({ shoes });
  } catch (err) {
    console.error("public/products error:", err);
    return res.status(500).json({ error: "Failed to load products" });
  }
}
