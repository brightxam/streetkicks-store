import { query } from "./db";
import rawShoes from "../../backend/shoes.json";

const USD_TO_RUB = 95;

function usdToRubAmount(priceStr) {
  if (!priceStr) return null;
  const usd = parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(usd)) return null;
  return Math.round((usd * USD_TO_RUB) / 10) * 10;
}

const COLUMNS = [
  "title",
  "brand",
  "primary_color",
  "primary_color_hex",
  "price_rub",
  "image_url",
  "product_url",
];

// One-time migration of the original demo catalog (backend/shoes.json,
// USD-style prices) into the products table (RUB integer prices), only
// runs if the table is empty - e.g. right after the DB is first created.
export async function seedProductsIfEmpty() {
  const { rows } = await query(`SELECT COUNT(*)::int AS count FROM products`);
  if (rows[0].count > 0) return;

  const values = [];
  const params = [];
  rawShoes.forEach((s, i) => {
    const offset = i * COLUMNS.length;
    const placeholders = COLUMNS.map((_, j) => `$${offset + j + 1}`).join(", ");
    values.push(`(${placeholders})`);
    params.push(
      s.title,
      s.brand || null,
      s.primary_color || null,
      s.primary_color_hex || null,
      usdToRubAmount(s.price),
      s.image_url,
      s.product_url || null
    );
  });
  if (values.length === 0) return;
  const sql = `INSERT INTO products (${COLUMNS.join(", ")}) VALUES ${values.join(", ")}`;
  await query(sql, params);
}

export async function listProducts() {
  const { rows } = await query(`SELECT * FROM products ORDER BY id ASC`);
  return rows;
}

export async function getProductById(id) {
  const { rows } = await query(`SELECT * FROM products WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createProduct(data) {
  const { rows } = await query(
    `INSERT INTO products (title, brand, primary_color, primary_color_hex, price_rub, image_url, product_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      data.title || "Untitled",
      data.brand || null,
      data.primary_color || null,
      data.primary_color_hex || null,
      data.price_rub != null ? Number(data.price_rub) : null,
      data.image_url || null,
      data.product_url || null,
    ]
  );
  return rows[0];
}

export async function updateProduct(id, data) {
  const { rows } = await query(
    `UPDATE products
     SET title = $1, brand = $2, primary_color = $3, primary_color_hex = $4,
         price_rub = $5, image_url = $6, product_url = $7, updated_at = now()
     WHERE id = $8
     RETURNING *`,
    [
      data.title,
      data.brand || null,
      data.primary_color || null,
      data.primary_color_hex || null,
      data.price_rub != null ? Number(data.price_rub) : null,
      data.image_url || null,
      data.product_url || null,
      id,
    ]
  );
  return rows[0] || null;
}

export async function deleteProduct(id) {
  await query(`DELETE FROM products WHERE id = $1`, [id]);
}
