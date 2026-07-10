import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AdminNav from "@/components/admin/AdminNav";

const ACCENT = "#ff3d1a";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EMPTY_NEW = {
  title: "",
  brand: "",
  primary_color: "",
  primary_color_hex: "",
  price_rub: "",
  image_url: "",
  product_url: "",
};

export default function AdminProducts() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [newProduct, setNewProduct] = useState(EMPTY_NEW);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRefs = useRef({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const sessionRes = await fetch("/api/admin/session");
      const session = await sessionRes.json();
      if (!session.authenticated) {
        router.replace("/admin/login");
        return;
      }
      setAuthChecked(true);
      loadProducts();
    })();
  }, [router]);

  const updateLocalField = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const saveProduct = async (product) => {
    setSavingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          price_rub:
            product.price_rub === "" || product.price_rub === null
              ? null
              : Number(product.price_rub),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      updateLocalField(product.id, "_saved", true);
      setTimeout(() => updateLocalField(product.id, "_saved", false), 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Удалить этот товар безвозвратно?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageChange = async (product, file) => {
    if (!file) return;
    setUploadingId(product.id);
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          dataBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateLocalField(product.id, "image_url", data.url);
      await saveProduct({ ...product, image_url: data.url });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price_rub: newProduct.price_rub === "" ? null : Number(newProduct.price_rub),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setProducts((prev) => [...prev, data.product]);
      setNewProduct(EMPTY_NEW);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!authChecked) return null;

  const filtered = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Товары - STREETKICKS Admin</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#fafafa",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <AdminNav active="products" />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 800, marginBottom: 4 }}>
            Товары
          </h1>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: 20 }}>
            {loading ? "Загрузка…" : `${products.length} товар(ов)`}
          </p>

          {error && <p style={{ color: "#c0392b", fontSize: "13px" }}>{error}</p>}

          {/* Add new product */}
          <form
            onSubmit={handleCreate}
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.06)",
              padding: "18px 20px",
              marginBottom: 20,
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 0.8fr auto",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <Field
              label="Название нового товара"
              value={newProduct.title}
              onChange={(v) => setNewProduct((p) => ({ ...p, title: v }))}
              required
            />
            <Field
              label="Бренд"
              value={newProduct.brand}
              onChange={(v) => setNewProduct((p) => ({ ...p, brand: v }))}
            />
            <Field
              label="Цвет"
              value={newProduct.primary_color}
              onChange={(v) => setNewProduct((p) => ({ ...p, primary_color: v }))}
            />
            <Field
              label="Цена ₽"
              type="number"
              value={newProduct.price_rub}
              onChange={(v) => setNewProduct((p) => ({ ...p, price_rub: v }))}
            />
            <button
              type="submit"
              disabled={creating}
              style={{
                background: ACCENT,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: creating ? "default" : "pointer",
                height: "38px",
              }}
            >
              {creating ? "Добавляем…" : "+ Добавить"}
            </button>
          </form>

          <input
            placeholder="Поиск по названию…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "13px",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: "64px 1.4fr 1fr 1fr 0.9fr auto auto",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => fileInputRefs.current[product.id]?.click()}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: "#f5f5f5",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                  title="Нажмите, чтобы заменить фото"
                >
                  {product.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  {uploadingId === product.id && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                      }}
                    >
                      Загрузка…
                    </div>
                  )}
                  <input
                    ref={(el) => (fileInputRefs.current[product.id] = el)}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleImageChange(product, e.target.files?.[0])
                    }
                  />
                </div>
                <input
                  value={product.title || ""}
                  onChange={(e) =>
                    updateLocalField(product.id, "title", e.target.value)
                  }
                  style={inputStyle}
                />
                <input
                  value={product.brand || ""}
                  onChange={(e) =>
                    updateLocalField(product.id, "brand", e.target.value)
                  }
                  placeholder="Бренд"
                  style={inputStyle}
                />
                <input
                  value={product.primary_color || ""}
                  onChange={(e) =>
                    updateLocalField(product.id, "primary_color", e.target.value)
                  }
                  placeholder="Цвет"
                  style={inputStyle}
                />
                <input
                  type="number"
                  value={product.price_rub ?? ""}
                  onChange={(e) =>
                    updateLocalField(product.id, "price_rub", e.target.value)
                  }
                  placeholder="Цена ₽"
                  style={inputStyle}
                />
                <button
                  onClick={() => saveProduct(product)}
                  disabled={savingId === product.id}
                  style={{
                    background: product._saved ? "#16a34a" : "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product._saved
                    ? "Сохранено ✓"
                    : savingId === product.id
                    ? "…"
                    : "Сохранить"}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{
                    background: "transparent",
                    color: "#c0392b",
                    border: "1px solid rgba(192,57,43,0.3)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.12)",
  fontSize: "12px",
  boxSizing: "border-box",
};

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: "10px",
          color: "#888",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={inputStyle}
      />
    </label>
  );
}
