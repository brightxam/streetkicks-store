import { requireAdmin } from "@/lib/requireAdmin";
import { ensureSchema } from "@/lib/schema";
import { listOrders } from "@/lib/orders";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    await ensureSchema();
    const orders = await listOrders();
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("admin/orders error:", err);
    return res.status(500).json({ error: "Failed to load orders" });
  }
}
