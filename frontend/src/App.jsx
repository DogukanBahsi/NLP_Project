/**
 * Ana uygulama bileşeni — routing ve route koruması.
 * Giriş yapmamış kullanıcılar dashboard'a erişemez, /login'e yönlendirilir.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Dashboard from "./Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Giriş yapmamış kullanıcıyı /login'e yönlendirir
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0f172a",
        color: "#94a3b8", fontFamily: "Inter, sans-serif", fontSize: "1rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid rgba(59,130,246,0.3)",
            borderTopColor: "#3b82f6", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Giriş yapmış kullanıcıyı dashboard'a yönlendirir
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      {/* Bilinmeyen route'ları ana sayfaya yönlendir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
