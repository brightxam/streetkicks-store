import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ACCENT = "#ff3d1a";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Вход в админ-панель - STREETKICKS</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "32px",
            width: "min(360px, 90vw)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ fontSize: "16px", fontWeight: 800, marginBottom: 4 }}>
            STREETKICKS
          </h1>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: 20 }}>
            Вход в админ-панель
          </p>
          <label style={{ display: "block", marginBottom: 16 }}>
            <span
              style={{
                display: "block",
                fontSize: "11px",
                color: "#888",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "13px",
                boxSizing: "border-box",
              }}
            />
          </label>
          {error && (
            <p style={{ color: "#c0392b", fontSize: "12px", marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: ACCENT,
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: "13px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </>
  );
}
