import { ensureSchema } from "@/lib/schema";
import { createOrder } from "@/lib/orders";
import { parseRub } from "@/lib/currency";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items, customer, paymentMethod, discountCode, total } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  try {
    await ensureSchema();
    const subtotal = items.reduce(
      (sum, it) => sum + parseRub(it.price) * (it.qty || 1),
      0
    );
    const order = await createOrder({
      items,
      customer,
      paymentMethod,
      subtotal,
      discountCode,
      total: total != null ? total : subtotal,
    });
    return res.status(200).json({
      mode: "live",
      orderId: order.order_ref,
      message:
        "Заказ принят и сохранён. Мы свяжемся с вами для подтверждения оплаты.",
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
}
