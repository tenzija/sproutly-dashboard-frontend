"use client";
import { deleteCookie, getCookie, setCookie } from "@/utils/cookies";
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getCookie("authTokens"));

  useEffect(() => {
    const token = getCookie("authTokens");
    setIsAuthenticated(!!token);
  }, []);

  const login = (token: string) => {
    setCookie("authTokens", JSON.stringify(token));
    setIsAuthenticated(true);
  };

  const logout = () => {
    deleteCookie("authTokens");
    window.location.replace("/login");
    setIsAuthenticated(false);

  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
