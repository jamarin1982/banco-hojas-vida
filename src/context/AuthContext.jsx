import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { apiMe } from "@/services/authApi";

const AuthContext = createContext(null);
const TOKEN_KEY = "bhv_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  // Evitar que el efecto corra más de una vez al montar
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    apiMe(storedToken)
      .then((u) => {
        // Si el rol en BD es diferente al del token (migración), forzar re-login
        const tokenPayload = JSON.parse(atob(storedToken.split(".")[1]));
        if (tokenPayload.rol !== u.rol) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
          return;
        }
        setUser(u);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
