import { useState } from "react";
import type { ReactNode } from "react";
import { DEMO_PASSWORD, mockUsers } from "../data/mockData";
import type { User } from "../types";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockUsers.find((item) => item.email === normalizedEmail);
    if (!user || password !== DEMO_PASSWORD) {
      return false;
    }
    setCurrentUser(user);
    return true;
  }

  function logout() {
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
