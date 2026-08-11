import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("anchor_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("anchor_token");
        localStorage.removeItem("anchor_user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("anchor_token", token);
    localStorage.setItem("anchor_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  const register = async (name, email, password, role = "sales_executive") => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });

    const { token, user } = response.data;

    localStorage.setItem("anchor_token", token);
    localStorage.setItem("anchor_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("anchor_token");
    localStorage.removeItem("anchor_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}