/**
 * Register sayfası:
 * - Kullanıcı adı, e-posta, şifre, şifre tekrar
 * - Şifre güçlülük göstergesi (zayıf/orta/güçlü)
 * - E-posta zaten kayıtlı kontrolü (backend'den)
 * - Başarılı kayıt → otomatik login → dashboard
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Şifre güçlülük skoru 0-3
function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))    score++;
  return score;
}

const STRENGTH_LABELS = ["", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

export default function Register() {
  const { register } = useAuth();
  const toast         = useToast();
  const navigate      = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", password: "", passwordConfirm: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const score = passwordScore(form.password);

  function validate() {
    const e = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      e.username = "Kullanıcı adı en az 3 karakter olmalı";
    if (!isValidEmail(form.email))
      e.email = "Geçerli bir e-posta adresi girin";
    if (form.password.length < 6)
      e.password = "Şifre en az 6 karakter olmalı";
    if (form.password !== form.passwordConfirm)
      e.passwordConfirm = "Şifreler eşleşmiyor";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const data = await register(form.username, form.email, form.password, form.passwordConfirm);
      toast.info("Doğrulama kodu e-postanıza gönderildi.");
      navigate("/verify-email", { state: { email: data.email, mode: "register" } });
    } catch (err) {
      const msg = err?.response?.data?.detail || "Kayıt başarısız. Tekrar deneyin.";
      setErrors({ server: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span>HotelReview<span className="text-accent">AI</span></span>
        </div>

        <h1 className="auth-title">Hesap oluştur</h1>
        <p className="auth-subtitle">Ücretsiz başlayın, hemen analiz edin</p>

        {errors.server && <div className="auth-error-banner">{errors.server}</div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Kullanıcı adı */}
          <div className="auth-field">
            <label className="auth-label">Kullanıcı Adı</label>
            <input
              className={`auth-input ${errors.username ? "auth-input--error" : ""}`}
              type="text"
              placeholder="ornek_kullanici"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              disabled={loading}
            />
            {errors.username && <p className="auth-field-error">{errors.username}</p>}
          </div>

          {/* E-posta */}
          <div className="auth-field">
            <label className="auth-label">E-posta</label>
            <input
              className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <p className="auth-field-error">{errors.email}</p>}
          </div>

          {/* Şifre */}
          <div className="auth-field">
            <label className="auth-label">Şifre</label>
            <PasswordInput
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="En az 6 karakter"
              error={!!errors.password}
              disabled={loading}
              autoComplete="new-password"
            />
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="auth-strength-bar"
                      style={{ background: n <= score ? STRENGTH_COLORS[score] : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </div>
                <span className="auth-strength-label" style={{ color: STRENGTH_COLORS[score] }}>
                  {STRENGTH_LABELS[score]}
                </span>
              </div>
            )}
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* Şifre tekrar */}
          <div className="auth-field">
            <label className="auth-label">Şifre Tekrar</label>
            <PasswordInput
              value={form.passwordConfirm}
              onChange={(v) => setForm({ ...form, passwordConfirm: v })}
              placeholder="Şifrenizi tekrar girin"
              error={!!errors.passwordConfirm}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <p className="auth-field-error">{errors.passwordConfirm}</p>}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Kayıt Ol"}
          </button>
        </form>

        <p className="auth-footer-text">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="auth-link">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, error, disabled, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-password-wrap">
      <input
        className={`auth-input ${error ? "auth-input--error" : ""}`}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete || "current-password"}
        disabled={disabled}
      />
      <button type="button" className="auth-eye-btn" onClick={() => setShow((s) => !s)} tabIndex={-1}>
        {show
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}
