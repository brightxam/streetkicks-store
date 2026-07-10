import { query } from "./db";
import { seedProductsIfEmpty } from "./products";

let schemaReadyPromise = null;

// Idempotent: creates tables if they don't exist yet, and seeds the
// product catalog from the original demo data on first run. Safe to call
// on every request - it's cheap once the tables already exist, and we
// memoize the in-flight promise per warm serverless instance.
export function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          brand TEXT,
          primary_color TEXT,
          primary_color_hex TEXT,
          price_rub INTEGER,
          image_url TEXT,
          product_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_ref TEXT UNIQUE NOT NULL,
          customer_name TEXT,
          customer_phone TEXT,
          customer_address TEXT,
          payment_method TEXT,
          items JSONB NOT NULL,
          subtotal INTEGER,
          discount_code TEXT,
          total INTEGER,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await seedProductsIfEmpty();
    })().catch((err) => {
      // Allow retrying on the next request if this attempt failed.
      schemaReadyPromise = null;
      throw err;
    });
  }
  return schemaReadyPromise;
}
