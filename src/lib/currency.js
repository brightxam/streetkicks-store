// --- CURRENCY HELPERS ---
//
// The demo catalog (backend/shoes.json) has USD-style prices like "$69".
// This store is priced in RUB for a Moscow-based shop, so we convert once
// at load time (see ShoeGrid.jsx) and every downstream component (3D tile
// labels, cart, checkout) just works with RUB strings/numbers.
//
// NOTE: USD_TO_RUB is a placeholder conversion rate for demo purposes only.
// Replace the real product prices (in RUB) directly in backend/shoes.json
// once you have your actual catalog — at that point this conversion step
// can be removed entirely.
const USD_TO_RUB = 95;

export function usdToRubLabel(priceStr) {
  if (!priceStr) return null;
  const usd = parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(usd)) return null;
  const rub = Math.round((usd * USD_TO_RUB) / 10) * 10;
  return formatRub(rub);
}

export function formatRub(amount) {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString("ru-RU")} ₽`;
}

export function parseRub(priceStr) {
  if (!priceStr) return 0;
  const n = parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
