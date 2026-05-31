/**
 * Login sayfası:
 * - Email / kullanıcı adı + şifre girişi
 * - "Beni hatırla" checkbox
 * - "Şifremi unuttum" linki (placeholder)
 * - Form validation: boş alan, email format, min şifre
 * - Loading state (giriş sırasında buton devre dışı)
 * - Başarılı girişte dashboard'a yönlendirme
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

// E-posta formatı kontrolü
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export default function Login() {
  const { login } = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim())                            e.email    = "E-posta veya kullanıcı adı gerekli";
    else if (form.email.includes("@") && !isValidEmail(form.email)) e.email = "Geçerli bir e-posta adresi girin";
    if (!form.password)                                e.password = "Şifre gerekli";
    else if (form.password.length < 6)                 e.password = "Şifre en az 6 karakter olmalı";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const data = await login(form.email, form.password, form.rememberMe);
      // login artık email döner, doğrulama sayfasına yönlendir
      toast.info("Doğrulama kodu e-postanıza gönderildi.");
      navigate("/verify-email", { state: { email: data.email, mode: "login" } });
    } catch (err) {
      const msg = err?.response?.data?.detail || "Giriş başarısız. Bilgilerinizi kontrol edin.";
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

        <h1 className="auth-title">Tekrar hoş geldiniz</h1>
        <p className="auth-subtitle">Devam etmek için giriş yapın</p>

        {errors.server && (
          <div className="auth-error-banner">{errors.server}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email / Kullanıcı adı */}
          <div className="auth-field">
            <label className="auth-label">E-posta veya Kullanıcı Adı</label>
            <input
              className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
              type="text"
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
            <div className="auth-label-row">
              <label className="auth-label">Şifre</label>
              <a href="#" className="auth-link" onClick={(e) => e.preventDefault()}>Şifremi unuttum</a>
            </div>
            <PasswordInput
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="En az 6 karakter"
              error={!!errors.password}
              disabled={loading}
            />
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* Beni hatırla */}
          <label className="auth-checkbox-row">
            <input
              type="checkbox"
              className="auth-checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              disabled={loading}
            />
            <span className="auth-checkbox-label">Beni hatırla</span>
          </label>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Giriş Yap"}
          </button>
        </form>

        <p className="auth-footer-text">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="auth-link">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}

// Göster/gizle butonlu şifre inputu
function PasswordInput({ value, onChange, placeholder, error, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-password-wrap">
      <input
        className={`auth-input ${error ? "auth-input--error" : ""}`}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="current-password"
        disabled={disabled}
      />
      <button
        type="button"
        className="auth-eye-btn"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
