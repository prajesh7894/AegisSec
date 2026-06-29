import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../api/client";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  user?: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("aegis_access_token"));

  const login = (newToken: string) => {
    localStorage.setItem("aegis_access_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("aegis_access_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
