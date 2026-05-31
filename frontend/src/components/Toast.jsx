/**
 * Toast bildirim sistemi.
 * Kullanım: useToast() hook'u ile toast.success/error/info çağrısı yapılır.
 */
import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const toast = {
    success: (msg) => push(msg, "success"),
    error:   (msg) => push(msg, "error"),
    info:    (msg) => push(msg, "info"),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            <span style={styles.icon}>{icons[t.type]}</span>
            <span style={styles.message}>{t.message}</span>
            <button style={styles.close} onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

const icons = { success: "✓", error: "✕", info: "ℹ" };

const styles = {
  container: {
    position: "fixed", bottom: 24, right: 24,
    display: "flex", flexDirection: "column", gap: 10,
    zIndex: 9999,
  },
  toast: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderRadius: 12,
    backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#f8fafc", fontSize: "0.9rem", fontFamily: "Inter, sans-serif",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    animation: "slideIn 0.3s ease",
    minWidth: 260, maxWidth: 380,
  },
  success: { background: "rgba(16,185,129,0.25)", borderColor: "rgba(16,185,129,0.4)" },
  error:   { background: "rgba(239,68,68,0.25)",  borderColor: "rgba(239,68,68,0.4)" },
  info:    { background: "rgba(59,130,246,0.25)",  borderColor: "rgba(59,130,246,0.4)" },
  icon:    { fontWeight: 700, fontSize: "1rem", flexShrink: 0 },
  message: { flex: 1 },
  close:   {
    background: "none", border: "none", color: "#94a3b8",
    cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: 0,
  },
};
