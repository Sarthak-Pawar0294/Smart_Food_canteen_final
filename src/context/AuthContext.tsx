import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load from localStorage, but also normalize roles
    const saved = localStorage.getItem("canteen_user");

    if (saved) {
      const u = JSON.parse(saved);

      // 🔥 Make sure role is correctly assigned
      const normalizedUser = {
        ...u,
        role: u.email === "canteen@vit.edu" ? "OWNER" : "STUDENT"
      };

      setUser(normalizedUser);
    }
  }, []);

  const login = (user: User) => {
    // 🔥 Normalize role here also
    const normalizedUser = {
      ...user,
      role: user.email === "canteen@vit.edu" ? "OWNER" : "STUDENT"
    };

    setUser(normalizedUser);
    localStorage.setItem("canteen_user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('canteen_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}