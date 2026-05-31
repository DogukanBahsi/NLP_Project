/**
 * AuthContext — uygulama genelinde kullanıcı oturumu yönetimi.
 * JWT token localStorage'da saklanır; sayfa yenilemede korunur.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, fetchMe } from "../api";

// AuthContext dışarıdan setUserFromToken çağrısına izin verir


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
    // Artık sadece kod gönderir, token döndürmez
    const data = await loginUser(email, password);
    if (rememberMe) localStorage.setItem("remember_me", "true");
    return data; // { message, email }
  }, []);

  const register = useCallback(async (username, email, password, passwordConfirm) => {
    // Artık sadece kod gönderir, token döndürmez
    const data = await registerUser(username, email, password, passwordConfirm);
    return data; // { message, email }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("remember_me");
    setUser(null);
  }, []);

  const setUserFromToken = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
