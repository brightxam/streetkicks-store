import React from "react";
import { useCart } from "@/context/CartContext";

const ACCENT = "#ff3d1a";

export default function Header() {
  const { count, openCart } = useCart();

  return (
    <header
      className="site-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "26px",
                fontWeight: "900",
                letterSpacing: "0.04em",
                color: "#000",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              STREET
            </span>
            <span
              style={{
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "26px",
                fontWeight: "900",
                letterSpacing: "0.04em",
                color: ACCENT,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              KICKS
            </span>
          </div>
          <span
            style={{
              fontFamily:
                "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "9px",
              fontWeight: "500",
              letterSpacing: "0.2em",
              color: "#999",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            streetkickscom
          </span>
        </div>
      </div>

      <div
        className="header-nav"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          pointerEvents: "auto",
        }}
      >
        <NavItem label="SHOP" number="01" />
        <NavItem label="DROPS" number="02" />
        <Divider />
        <CartButton count={count} onClick={openCart} />
      </div>

      <div
        className="mobile-cart"
        style={{
          display: "none",
          pointerEvents: "auto",
        }}
      >
        <CartButton count={count} onClick={openCart} />
      </div>

      <style>{`
        @media (max-width: 600px) {
          .site-header {
            padding: 16px 20px !important;
          }
          .header-nav {
            display: none !important;
          }
          .mobile-cart {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

function CartButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open cart"
      style={{
        position: "relative",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        width: "32px",
        height: "32px",
        color: "#000",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-8px",
            background: ACCENT,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            borderRadius: "999px",
            minWidth: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function NavItem({ label, number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "6px",
        cursor: "pointer",
        opacity: 0.6,
        transition: "opacity 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
    >
      <span
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "9px",
          fontWeight: "400",
          color: "#999",
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "11px",
          fontWeight: "500",
          letterSpacing: "0.08em",
          color: "#000",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "12px",
        background: "rgba(0,0,0,0.15)",
      }}
    />
  );
}
