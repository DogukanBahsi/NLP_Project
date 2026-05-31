/**
 * E-posta doğrulama sayfası.
 * Login veya Register sonrası gösterilir.
 * 6 haneli kod girilir, doğrulama yapılır.
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { verifyLogin, verifyEmail } from "../api";

export default function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setUserFromToken } = useAuth();
  const toast = useToast();

  // Login veya Register'dan gelen email + mod
  const { email, mode } = location.state || {};

  const [code, setCode]       = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
    inputs.current[0]?.focus();
  }, []);

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setCode(text.split(""));
      inputs.current[5]?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) { setError("6 haneli kodu eksiksiz girin"); return; }

    setLoading(true);
    setError("");
    try {
      const fn = mode === "register" ? verifyEmail : verifyLogin;
      const data = await fn(email, fullCode);
      localStorage.setItem("auth_token", data.access_token);
      setUserFromToken(data.user);
      toast.success("Doğrulama başarılı! Hoş geldiniz.");
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || "Kod hatalı veya süresi dolmuş";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span>HotelReview<span className="text-accent">AI</span></span>
        </div>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h1 className="auth-title" style={{fontSize:"1.4rem"}}>E-postanı doğrula</h1>
          <p className="auth-subtitle">
            <strong style={{color:"var(--text-primary)"}}>{email}</strong> adresine<br/>6 haneli kod gönderdik
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* 6 Haneli Kod Inputları */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                style={{
                  width:46, height:56, textAlign:"center",
                  fontSize:"1.4rem", fontWeight:700,
                  background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${digit ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius:10, color:"var(--text-primary)",
                  outline:"none", fontFamily:"Inter,sans-serif",
                  transition:"border-color 0.2s",
                }}
              />
            ))}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"/> : "Doğrula"}
          </button>
        </form>

        <p className="auth-footer-text" style={{marginTop:16}}>
          Kod gelmedi mi?{" "}
          <a href="#" className="auth-link" onClick={e => { e.preventDefault(); navigate(-1); }}>
            Geri dön
          </a>
        </p>
      </div>
    </div>
  );
}
