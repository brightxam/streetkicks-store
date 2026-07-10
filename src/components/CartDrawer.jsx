import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatRub } from "@/lib/currency";

const ACCENT = "#ff3d1a";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 200,
            }}
          />
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(400px, 100vw)",
              background: "#fff",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Корзина ({items.reduce((n, it) => n + it.qty, 0)})
              </span>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "20px",
                  lineHeight: 1,
                  color: "#111",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
              {items.length === 0 ? (
                <p style={{ color: "#888", fontSize: "14px", marginTop: 24 }}>
                  Корзина пуста. Нажмите на кроссовок и добавьте его в корзину,
                  чтобы начать покупки.
                </p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "16px 0",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image_url}
                      alt={it.title}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "contain",
                        background: "#f5f5f5",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {it.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: 2 }}>
                        {it.price || "Цена по запросу"}
                        {it.size && ` · Размер ${it.size}`}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "8px",
                        }}
                      >
                        <QtyButton onClick={() => updateQty(it.id, it.qty - 1)}>
                          −
                        </QtyButton>
                        <span style={{ fontSize: "13px", minWidth: 16, textAlign: "center" }}>
                          {it.qty}
                        </span>
                        <QtyButton onClick={() => updateQty(it.id, it.qty + 1)}>
                          +
                        </QtyButton>
                        <button
                          onClick={() => removeItem(it.id)}
                          style={{
                            marginLeft: "auto",
                            border: "none",
                            background: "transparent",
                            color: "#aaa",
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            cursor: "pointer",
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                padding: "20px 24px 24px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: "14px",
                }}
              >
                <span style={{ color: "#888" }}>Итого</span>
                <span style={{ fontWeight: 700 }}>{formatRub(subtotal)}</span>
              </div>
              <Link href="/checkout" legacyBehavior>
                <a
                  onClick={closeCart}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: items.length ? ACCENT : "#ddd",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    pointerEvents: items.length ? "auto" : "none",
                  }}
                >
                  Оформить заказ
                </a>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: "1px solid rgba(0,0,0,0.15)",
        background: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
