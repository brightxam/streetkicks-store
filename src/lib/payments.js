// --- PAYMENT CONFIGURATION (RU market) ---
//
// This store is based in Moscow and takes payment via SBP (Система быстрых
// платежей / Fast Payment System) QR code or direct bank transfer — the
// standard ways Russian merchants accept online payments (Western
// processors like Stripe/PayPal are not usable here).
//
// WHAT'S REAL VS. PLACEHOLDER RIGHT NOW:
// - The SBP QR code below is generated client-side (see checkout.js) and
//   encodes a human-readable payment note, NOT a real bank-issued SBP
//   payload. A real, scannable SBP QR must come from your acquiring bank
//   or a payment aggregator — it can't be generated from scratch without
//   a merchant agreement.
// - The bank transfer details (BANK_DETAILS below) are placeholders.
//
// TO ACCEPT REAL PAYMENTS:
// Sign up with a Russian payment provider that issues real SBP QR codes via
// API, e.g. YooKassa (ЮKassa), CloudPayments, or Tinkoff Acquiring. They'll
// give you an API key; call their "create SBP QR" endpoint from
// `src/pages/api/checkout.js` instead of the mock branch below, and swap
// the generated QR image for the one their API returns.
//
// Replace BANK_DETAILS with your real requisites once you have a business
// bank account.

export const PAYMENTS_CONFIGURED = false;

export const BANK_DETAILS = {
  recipient: "IP Ivanov I.I. (placeholder — add your real legal name)",
  bank: "Placeholder Bank",
  account: "0000 0000 0000 0000",
  inn: "000000000000",
  bic: "000000000",
};

export async function createCheckoutSession({ items, customer }) {
  return {
    mode: "mock",
    orderId: `SK-${Date.now().toString(36).toUpperCase()}`,
    message:
      "Order recorded. This store isn't connected to a real SBP/bank integration yet, so no payment was actually processed — confirm manually with the customer for now.",
  };
}
