import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavedUser, getJwt, clearTokens, getSavedAccounts, addSavedAccount, removeSavedAccount, trySilentLogin, setTokens, saveUser, SavedAccount } from '../api/client';
import { loginWithEmail, loginWithQR, loginWithGoogle, logout as apiLogout } from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  loginQR: (token: string) => Promise<void>;
  loginGoogle: (code: string, redirectUri?: string) => Promise<void>;
  loginOAuthToken: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  savedAccounts: SavedAccount[];
  refreshSavedAccounts: () => Promise<void>;
  removeAccount: (email: string) => Promise<void>;
  silentLogin: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  const refreshSavedAccounts = useCallback(async () => {
    const accounts = await getSavedAccounts();
    setSavedAccounts(accounts);
  }, []);

  useEffect(() => {
    getSavedUser().then((u) => {
      if (u) setUser(u);
      setIsLoading(false);
    });
    refreshSavedAccounts();
  }, []);

  const getAccessToken = useCallback(async () => {
    return getJwt();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithEmail(email, password);
    setUser(result.user);
    if (result.tokens.refresh_token) {
      await addSavedAccount(result.user, result.tokens.refresh_token);
      await refreshSavedAccounts();
    }
  }, [refreshSavedAccounts]);

  const loginQR = useCallback(async (token: string) => {
    const result = await loginWithQR(token);
    setUser(result.user);
    if (result.tokens.refresh_token) {
      await addSavedAccount(result.user, result.tokens.refresh_token);
      await refreshSavedAccounts();
    }
  }, [refreshSavedAccounts]);

  const loginGoogle = useCallback(async (idToken: string, redirectUri?: string) => {
    const result = await loginWithGoogle(idToken, redirectUri);
    setUser(result.user);
    if (result.tokens.refresh_token) {
      await addSavedAccount(result.user, result.tokens.refresh_token);
      await refreshSavedAccounts();
    }
  }, [refreshSavedAccounts]);

  const loginOAuthToken = useCallback(async (token: string, oauthUser: User) => {
    await setTokens({ jwt: token });
    await saveUser(oauthUser);
    setUser(oauthUser);
    await refreshSavedAccounts();
  }, [refreshSavedAccounts]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    await refreshSavedAccounts();
  }, [refreshSavedAccounts]);

  const removeAccount = useCallback(async (email: string) => {
    await removeSavedAccount(email);
    await refreshSavedAccounts();
  }, [refreshSavedAccounts]);

  const silentLogin = useCallback(async (email: string): Promise<boolean> => {
    const result = await trySilentLogin(email);
    if (result) {
      setUser(result.user);
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, getAccessToken, login, loginQR, loginGoogle, loginOAuthToken, logout, savedAccounts, refreshSavedAccounts, removeAccount, silentLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthContext');
  return ctx;
}
