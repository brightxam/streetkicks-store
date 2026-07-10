import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRIZES,
  canSpinToday,
  recordSpin,
  getActivePrize,
} from "@/lib/loyalty";

const ACCENT = "#ff3d1a";
const SEGMENT_ANGLE = 360 / PRIZES.length;

export default function LoyaltyGame() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [activePrize, setActivePrize] = useState(null);
  const spinCountRef = useRef(0);

  const gradient = useMemo(() => {
    const stops = PRIZES.map((p, i) => {
      const from = i * SEGMENT_ANGLE;
      const to = (i + 1) * SEGMENT_ANGLE;
      return `${p.color} ${from}deg ${to}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, []);

  const handleOpen = () => {
    setHasSpunToday(!canSpinToday());
    setActivePrize(getActivePrize());
    setResult(null);
    setOpen(true);
  };

  const handleSpin = () => {
    if (spinning || hasSpunToday) return;
    setSpinning(true);
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];
    spinCountRef.current += 1;
    // Land the pointer (fixed at top) on the middle of the chosen segment,
    // with several extra full turns for visual effect.
    const targetAngle =
      360 * 5 +
      (360 - (prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2));
    setRotation((prev) => prev + targetAngle);
    setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setHasSpunToday(true);
      recordSpin(prize);
      setActivePrize(prize.code ? prize : null);
    }, 3200);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        aria-label="Открыть игру-приз"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed",
          left: "20px",
          bottom: "40px",
          zIndex: 90,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: `linear-gradient(135deg, ${ACCENT}, #ff7a52)`,
          boxShadow: "0 8px 24px rgba(255,61,26,0.4)",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.span
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.6 }}
        >
          🎁
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="loyalty-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 300,
              }}
            />
            <motion.div
              key="loyalty-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 301,
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                width: "min(360px, 92vw)",
                textAlign: "center",
                fontFamily:
                  "'Helvetica Neue', Helvetica, Arial, sans-serif",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>

              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  margin: "0 0 4px",
                  letterSpacing: "0.02em",
                }}
              >
                Колесо призов STREETKICKS
              </h2>
              <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px" }}>
                Один бесплатный спин в день — выигрывайте скидку на заказ.
              </p>

              <div
                style={{
                  position: "relative",
                  width: "220px",
                  height: "220px",
                  margin: "0 auto 20px",
                }}
              >
                {/* Pointer */}
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: `16px solid ${ACCENT}`,
                    zIndex: 2,
                  }}
                />
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 3, ease: [0.17, 0.67, 0.32, 1.0] }}
                  style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    background: gradient,
                    border: "4px solid #fff",
                    boxShadow: "0 0 0 2px rgba(0,0,0,0.08)",
                    position: "relative",
                  }}
                >
                  {PRIZES.map((p, i) => {
                    const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
                    return (
                      <div
                        key={p.label}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "90px",
                          textAlign: "center",
                          fontSize: "9px",
                          fontWeight: 700,
                          color: p.color === "#efe9e4" ? "#333" : "#fff",
                          whiteSpace: "pre-line",
                          transform: `rotate(${angle}deg) translate(0, -88px) rotate(0deg)`,
                          transformOrigin: "top left",
                          lineHeight: 1.2,
                        }}
                      >
                        {p.label}
                      </div>
                    );
                  })}
                </motion.div>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 1,
                  }}
                />
              </div>

              {result ? (
                <div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: result.code ? ACCENT : "#555",
                      marginBottom: "6px",
                    }}
                  >
                    {result.code
                      ? `Вы выиграли: ${result.label.replace("\n", " ")}!`
                      : "В этот раз не повезло"}
                  </div>
                  {result.code && (
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      Код <strong>{result.code}</strong> уже применён и
                      сохранён — используйте его при оформлении заказа.
                    </p>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      marginTop: "14px",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 22px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Готово
                  </button>
                </div>
              ) : hasSpunToday ? (
                <div>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    {activePrize
                      ? `Сегодня вы уже выиграли код ${activePrize.code}. Возвращайтесь завтра за новым спином!`
                      : "Вы уже крутили колесо сегодня. Возвращайтесь завтра!"}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  style={{
                    background: ACCENT,
                    color: "#fff",
                    border: "none",
                    borderRadius: "999px",
                    padding: "12px 28px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    cursor: spinning ? "default" : "pointer",
                    opacity: spinning ? 0.6 : 1,
                  }}
                >
                  {spinning ? "Крутим…" : "Крутить"}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
