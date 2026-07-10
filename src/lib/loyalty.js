// STREETKICKS loyalty "Spin to Win" mini-game.
// Simple client-side (localStorage) reward mechanic: one free spin per
// calendar day, wins a discount code applied automatically at checkout.

const LAST_SPIN_KEY = "streetkicks_loyalty_last_spin";
const ACTIVE_PRIZE_KEY = "streetkicks_loyalty_prize";

// Wheel segments. `percentOff` is a fraction (0.1 = 10%). `flatOff` is in RUB.
export const PRIZES = [
  { label: "5% скидка", code: "SK5", percentOff: 0.05, color: "#ff3d1a" },
  { label: "Не повезло", code: null, percentOff: 0, color: "#efe9e4" },
  { label: "10% скидка", code: "SK10", percentOff: 0.1, color: "#1a1a1a" },
  { label: "300₽ скидка", code: "SK300", flatOff: 300, color: "#ff3d1a" },
  { label: "15% скидка", code: "SK15", percentOff: 0.15, color: "#1a1a1a" },
  { label: "Бесплатная\nдоставка", code: "SKSHIP", freeShipping: true, color: "#efe9e4" },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function canSpinToday() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LAST_SPIN_KEY) !== todayKey();
  } catch (e) {
    return true;
  }
}

export function recordSpin(prize) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SPIN_KEY, todayKey());
    if (prize && prize.code) {
      window.localStorage.setItem(
        ACTIVE_PRIZE_KEY,
        JSON.stringify({ ...prize, wonOn: todayKey() })
      );
    }
  } catch (e) {}
}

export function getActivePrize() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PRIZE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearActivePrize() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACTIVE_PRIZE_KEY);
  } catch (e) {}
}

export function applyDiscount(subtotal, prize) {
  if (!prize) return subtotal;
  let result = subtotal;
  if (prize.percentOff) result -= subtotal * prize.percentOff;
  if (prize.flatOff) result -= prize.flatOff;
  return Math.max(0, Math.round(result));
}
