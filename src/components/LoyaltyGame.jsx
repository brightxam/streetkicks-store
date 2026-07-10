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
                background: "rgba(0,0,0,0.55)",
                zIndex: 300,
              }}
            />
            {/* Plain (non-animated) full-viewport flex wrapper handles centering.
                Framer Motion takes exclusive ownership of the CSS `transform`
                property on animated elements, so combining a manual
                translate(-50%,-50%) centering hack with motion-driven
                scale/y animations on the SAME element silently breaks the
                centering (the element ends up offset by half its own size,
                which is what was pushing this modal off-screen on mobile).
                Centering the modal with flexbox on an uninvolved parent
                sidesteps that conflict entirely. */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 301,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                pointerEvents: "none",
              }}
            >
              <motion.div
                key="loyalty-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                style={{
                  pointerEvents: "auto",
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "26px 20px",
                  width: "min(340px, 100%)",
                  maxHeight: "calc(100vh - 32px)",
                  overflowY: "auto",
                  textAlign: "center",
                  fontFamily:
                    "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    border: "none",
                    background: "#f2f2f2",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#777",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>

                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    margin: "0 0 4px",
                    letterSpacing: "0.02em",
                  }}
                >
                  Колесо призов STREETKICKS
                </h2>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 20px" }}>
                  Один бесплатный спин в день — выигрывайте скидку на заказ.
                </p>

                <div
                  style={{
                    position: "relative",
                    width: "min(220px, 62vw)",
                    aspectRatio: "1 / 1",
                    margin: "0 auto 22px",
                  }}
                >
                  {/* Pointer */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-7px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "9px solid transparent",
                      borderRight: "9px solid transparent",
                      borderTop: `15px solid ${ACCENT}`,
                      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))",
                      zIndex: 2,
                    }}
                  />
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: [0.17, 0.67, 0.32, 1.0] }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: gradient,
                      border: "5px solid #fff",
                      boxShadow:
                        "0 0 0 2px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.15)",
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
                            width: "72px",
                            marginLeft: "-36px",
                            textAlign: "center",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: p.color === "#efe9e4" ? "#333" : "#fff",
                            whiteSpace: "pre-line",
                            // Rotate out to the segment, slide out along the
                            // radius, then rotate BACK by the same amount so
                            // the label itself always reads upright instead
                            // of sideways/upside-down.
                            transform: `rotate(${angle}deg) translate(0, -38%) rotate(${-angle}deg)`,
                            transformOrigin: "center",
                            lineHeight: 1.25,
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
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
                      boxShadow: spinning
                        ? "none"
                        : "0 6px 18px rgba(255,61,26,0.35)",
                    }}
                  >
                    {spinning ? "Крутим…" : "Крутить"}
                  </button>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
