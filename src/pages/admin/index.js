import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AdminNav from "@/components/admin/AdminNav";
import { formatRub } from "@/lib/currency";

export default function AdminOrders() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      const sessionRes = await fetch("/api/admin/session");
      const session = await sessionRes.json();
      if (!session.authenticated) {
        router.replace("/admin/login");
        return;
      }
      setAuthChecked(true);
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders");
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (!authChecked) return null;

  return (
    <>
      <Head>
        <title>Заказы - STREETKICKS Admin</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#fafafa",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <AdminNav active="orders" />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 800, marginBottom: 4 }}>
            Заказы
          </h1>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: 24 }}>
            {loading ? "Загрузка…" : `${orders.length} заказ(ов)`}
          </p>

          {error && (
            <p style={{ color: "#c0392b", fontSize: "13px" }}>{error}</p>
          )}

          {!loading && orders.length === 0 && !error && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "32px",
                border: "1px solid rgba(0,0,0,0.06)",
                color: "#888",
                fontSize: "13px",
              }}
            >
              Заказов пока нет.
            </div>
          )}

          {orders.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              {orders.map((order) => {
                const isExpanded = expandedId === order.id;
                return (
                  <div
                    key={order.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <div
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr 1fr 0.8fr 0.8fr",
                        gap: "12px",
                        padding: "14px 20px",
                        fontSize: "12px",
                        cursor: "pointer",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{order.order_ref}</span>
                      <span style={{ color: "#666" }}>
                        {new Date(order.created_at).toLocaleString("ru-RU")}
                      </span>
                      <span>{order.customer_name || "—"}</span>
                      <span style={{ color: "#666" }}>
                        {order.customer_phone || "—"}
                      </span>
                      <span>
                        {order.payment_method === "sbp"
                          ? "СБП"
                          : order.payment_method === "bank"
                          ? "Перевод"
                          : order.payment_method || "—"}
                      </span>
                      <span style={{ fontWeight: 700, textAlign: "right" }}>
                        {formatRub(order.total)}
                      </span>
                    </div>
                    {isExpanded && (
                      <div
                        style={{
                          padding: "0 20px 18px",
                          fontSize: "12px",
                          color: "#555",
                        }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <strong>Адрес:</strong>{" "}
                          {order.customer_address || "—"}
                        </div>
                        {order.discount_code && (
                          <div style={{ marginBottom: 8 }}>
                            <strong>Промокод:</strong> {order.discount_code}
                          </div>
                        )}
                        <div style={{ marginBottom: 8 }}>
                          <strong>Товары:</strong>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {(order.items || []).map((it, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "#fafafa",
                                borderRadius: 6,
                                padding: "6px 10px",
                              }}
                            >
                              <span>
                                {it.title}
                                {it.size ? ` · размер ${it.size}` : ""} × {it.qty}
                              </span>
                              <span>{it.price}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10, fontSize: "11px", color: "#999" }}>
                          Подытог: {formatRub(order.subtotal)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
