import { query } from "./db";

function generateOrderRef() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SK-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function createOrder({
  items,
  customer,
  paymentMethod,
  subtotal,
  discountCode,
  total,
}) {
  const orderRef = generateOrderRef();
  const { rows } = await query(
    `INSERT INTO orders
      (order_ref, customer_name, customer_phone, customer_address, payment_method, items, subtotal, discount_code, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      orderRef,
      customer?.name || null,
      customer?.phone || null,
      customer?.address || null,
      paymentMethod || null,
      JSON.stringify(items || []),
      Math.round(subtotal || 0),
      discountCode || null,
      Math.round(total ?? subtotal ?? 0),
    ]
  );
  return rows[0];
}

export async function listOrders() {
  const { rows } = await query(`SELECT * FROM orders ORDER BY created_at DESC`);
  return rows;
}

export async function getOrderById(id) {
  const { rows } = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
  return rows[0] || null;
}
