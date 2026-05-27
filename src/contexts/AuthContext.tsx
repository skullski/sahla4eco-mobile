import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavedUser, getJwt, clearTokens } from '../api/client';
import { loginWithEmail, loginWithQR, logout as apiLogout } from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  loginQR: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSavedUser().then((u) => {
      if (u) setUser(u);
      setIsLoading(false);
    });
  }, []);

  const getAccessToken = useCallback(async () => {
    return getJwt();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithEmail(email, password);
    setUser(result.user);
  }, []);

  const loginQR = useCallback(async (token: string) => {
    const result = await loginWithQR(token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, getAccessToken, login, loginQR, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
