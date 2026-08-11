import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("anchor_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("anchor_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("anchor_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("anchor_token");
        localStorage.removeItem("anchor_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("anchor_token", data.token);
    localStorage.setItem("anchor_user", JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    localStorage.setItem("anchor_token", data.token);
    localStorage.setItem("anchor_user", JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("anchor_token");
    localStorage.removeItem("anchor_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);