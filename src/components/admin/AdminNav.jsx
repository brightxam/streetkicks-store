import Link from "next/link";
import { useRouter } from "next/router";

const ACCENT = "#ff3d1a";

export default function AdminNav({ active }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ fontWeight: 800, fontSize: "14px" }}>
          STREET<span style={{ color: ACCENT }}>KICKS</span>{" "}
          <span style={{ color: "#999", fontWeight: 500 }}>admin</span>
        </span>
        <Link
          href="/admin"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            color: active === "orders" ? "#000" : "#888",
            borderBottom: active === "orders" ? `2px solid ${ACCENT}` : "none",
            paddingBottom: 2,
          }}
        >
          Заказы
        </Link>
        <Link
          href="/admin/products"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            color: active === "products" ? "#000" : "#888",
            borderBottom: active === "products" ? `2px solid ${ACCENT}` : "none",
            paddingBottom: 2,
          }}
        >
          Товары
        </Link>
      </div>
      <button
        onClick={handleLogout}
        style={{
          border: "1px solid rgba(0,0,0,0.15)",
          background: "#fff",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: "11px",
          cursor: "pointer",
        }}
      >
        Выйти
      </button>
    </div>
  );
}
