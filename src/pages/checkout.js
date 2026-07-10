import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRub } from "@/lib/currency";
import { BANK_DETAILS } from "@/lib/payments";
import { getActivePrize, applyDiscount, clearActivePrize } from "@/lib/loyalty";

const ACCENT = "#ff3d1a";

export default function CheckoutPage() {
  const { items, subtotal, removeItem, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [method, setMethod] = useState("sbp"); // 'sbp' | 'bank'
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activePrize, setActivePrize] = useState(null);

  useEffect(() => {
    setActivePrize(getActivePrize());
  }, []);

  const total = activePrize ? applyDiscount(subtotal, activePrize) : subtotal;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Generate an SBP-style QR code client-side whenever the amount/method changes.
  // NOTE: this encodes a human-readable payment note, not a real bank SBP
  // payload — see src/lib/payments.js for what's needed to make it real.
  useEffect(() => {
    if (method !== "sbp" || items.length === 0) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      const payload = `STREETKICKS PAYMENT\nAmount: ${formatRub(
        total
      )}\nItems: ${items.reduce((n, it) => n + it.qty, 0)}\nRef: ${form.phone || "—"}`;
      QRCode.toDataURL(payload, { width: 220, margin: 1 }).then((url) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [method, items, total, form.phone]);

  const copyBankDetails = () => {
    const text = `Получатель: ${BANK_DETAILS.recipient}\nБанк: ${BANK_DETAILS.bank}\nСчёт: ${BANK_DETAILS.account}\nИНН: ${BANK_DETAILS.inn}\nБИК: ${BANK_DETAILS.bic}\nСумма: ${formatRub(total)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: form,
          paymentMethod: method,
          discountCode: activePrize?.code || null,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setOrder(data);
      clearCart();
      clearActivePrize();
      setActivePrize(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Оформление заказа - STREETKICKS</title>
      </Head>
      <div
        className="checkout-page"
        style={{
          minHeight: "100vh",
          background: "#fafafa",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              color: "#888",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            ← Назад в магазин
          </Link>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: "16px 0 4px",
              letterSpacing: "0.02em",
            }}
          >
            Оформление заказа
          </h1>
          <p style={{ fontSize: "12px", color: "#999", marginBottom: 28 }}>
            Доставка и самовывоз — Москва
          </p>

          {order ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "32px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ fontSize: "18px", marginBottom: 8 }}>
                Заказ принят
              </h2>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.6 }}>
                Номер заказа: <strong>{order.orderId}</strong>
                <br />
                {order.message}
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  background: ACCENT,
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                Продолжить покупки
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "32px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <p style={{ color: "#555", fontSize: "14px" }}>
                Ваша корзина пуста.{" "}
                <Link href="/" style={{ color: ACCENT }}>
                  Выбрать кроссовки
                </Link>
              </p>
            </div>
          ) : (
            <div className="checkout-grid">
              {/* Order summary */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  height: "fit-content",
                }}
              >
                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "16px",
                    color: "#888",
                  }}
                >
                  Ваш заказ
                </h2>
                {items.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      alignItems: "center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image_url}
                      alt={it.title}
                      style={{
                        width: 52,
                        height: 52,
                        objectFit: "contain",
                        background: "#f5f5f5",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, fontSize: "13px", minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{it.title}</div>
                      <div style={{ color: "#888", fontSize: "12px" }}>
                        {it.qty} шт · {it.price || "Цена по запросу"}
                        {it.size && ` · Размер ${it.size}`}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#bbb",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {activePrize && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      fontSize: "12px",
                      color: ACCENT,
                    }}
                  >
                    <span>Промокод {activePrize.code}</span>
                    <span>−{formatRub(subtotal - total)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  <span>Итого</span>
                  <span>{formatRub(total)}</span>
                </div>
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: 10 }}>
                  Доставка по Москве уточняется менеджером после оформления.
                </p>
              </div>

              {/* Contact + payment */}
              <form
                onSubmit={placeOrder}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "24px",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "16px",
                    color: "#888",
                  }}
                >
                  Контакты и доставка
                </h2>
                <Field
                  label="Имя"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Телефон"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Адрес доставки (Москва) или самовывоз"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "20px 0 12px",
                    color: "#888",
                  }}
                >
                  Способ оплаты
                </h2>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <MethodTab
                    active={method === "sbp"}
                    onClick={() => setMethod("sbp")}
                  >
                    QR-код (СБП)
                  </MethodTab>
                  <MethodTab
                    active={method === "bank"}
                    onClick={() => setMethod("bank")}
                  >
                    Банковский перевод
                  </MethodTab>
                </div>

                {method === "sbp" ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      background: "#fafafa",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QR-код для оплаты через СБП"
                        style={{ width: 180, height: 180, margin: "0 auto" }}
                      />
                    ) : (
                      <div style={{ fontSize: "12px", color: "#999", padding: "60px 0" }}>
                        Генерация QR-кода…
                      </div>
                    )}
                    <p style={{ fontSize: "12px", color: "#666", marginTop: 10 }}>
                      Отсканируйте в приложении банка для оплаты через СБП на
                      сумму {formatRub(total)}.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      background: "#fafafa",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.06)",
                      fontSize: "12px",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>Получатель: {BANK_DETAILS.recipient}</div>
                    <div>Банк: {BANK_DETAILS.bank}</div>
                    <div>Счёт: {BANK_DETAILS.account}</div>
                    <div>ИНН: {BANK_DETAILS.inn}</div>
                    <div>БИК: {BANK_DETAILS.bic}</div>
                    <div style={{ fontWeight: 700, marginTop: 6 }}>
                      Сумма: {formatRub(total)}
                    </div>
                    <button
                      type="button"
                      onClick={copyBankDetails}
                      style={{
                        marginTop: 10,
                        border: "1px solid rgba(0,0,0,0.15)",
                        background: "#fff",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      {copied ? "Скопировано ✓" : "Скопировать реквизиты"}
                    </button>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "16px",
                    padding: "10px 12px",
                    background: "#fff7f5",
                    border: "1px solid #ffd9cf",
                    borderRadius: 8,
                    fontSize: "11px",
                    color: "#a04b32",
                    lineHeight: 1.5,
                  }}
                >
                  Оплата пока не подключена к реальному банку — это
                  демонстрационный QR/реквизиты. Подключите ЮKassa,
                  CloudPayments или Tinkoff Acquiring в{" "}
                  <code>src/lib/payments.js</code>, когда будете готовы
                  принимать настоящие платежи.
                </div>

                {error && (
                  <p style={{ color: "#c0392b", fontSize: "12px", marginTop: 10 }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={placing}
                  style={{
                    marginTop: "20px",
                    width: "100%",
                    background: ACCENT,
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: placing ? "default" : "pointer",
                    opacity: placing ? 0.6 : 1,
                  }}
                >
                  {placing ? "Оформляем…" : "Подтвердить заказ"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .checkout-page {
          padding: 40px 20px;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 720px) {
          .checkout-page {
            padding: 20px 14px;
          }
          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

function MethodTab({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRadius: 8,
        border: active ? "2px solid #ff3d1a" : "1px solid rgba(0,0,0,0.12)",
        background: active ? "#fff7f5" : "#fff",
        color: active ? "#ff3d1a" : "#555",
        fontWeight: 600,
        fontSize: "12px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, name, value, onChange, type = "text", required }) {
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      <span
        style={{
          display: "block",
          fontSize: "11px",
          color: "#888",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.15)",
          fontSize: "13px",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}
