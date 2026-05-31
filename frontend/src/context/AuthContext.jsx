/**
 * AuthContext — uygulama genelinde kullanıcı oturumu yönetimi.
 * JWT token localStorage'da saklanır; sayfa yenilemede korunur.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, fetchMe } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // başlangıç token kontrolü

  // Sayfa açılışında mevcut token'ı doğrula
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) { setLoading(false); return; }

    fetchMe(token)
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("auth_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const data = await loginUser(email, password);
    localStorage.setItem("auth_token", data.access_token);
    if (rememberMe) localStorage.setItem("remember_me", "true");
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, email, password, passwordConfirm) => {
    const data = await registerUser(username, email, password, passwordConfirm);
    localStorage.setItem("auth_token", data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("remember_me");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
