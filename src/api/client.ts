import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/api';
import type { AuthTokens, User } from '../types';

export interface SavedAccount {
  email: string;
  name: string;
  refresh_token: string;
}

let cachedJwt: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function getJwt(): Promise<string | null> {
  if (cachedJwt) return cachedJwt;
  try {
    cachedJwt = await SecureStore.getItemAsync(STORAGE_KEYS.JWT);
    return cachedJwt;
  } catch { return null; }
}

async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch { return null; }
}

export async function setTokens(tokens: AuthTokens): Promise<void> {
  cachedJwt = tokens.jwt;
  await SecureStore.setItemAsync(STORAGE_KEYS.JWT, tokens.jwt);
  if (tokens.refresh_token) {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }
}

export async function clearTokens(): Promise<void> {
  cachedJwt = null;
  await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.SAVED_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addSavedAccount(user: User, refreshToken: string): Promise<void> {
  const accounts = await getSavedAccounts();
  const existing = accounts.findIndex(a => a.email === user.email);
  const account: SavedAccount = { email: user.email, name: user.name, refresh_token: refreshToken };
  if (existing >= 0) {
    accounts[existing] = account;
  } else {
    accounts.unshift(account);
  }
  await SecureStore.setItemAsync(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(accounts));
}

export async function removeSavedAccount(email: string): Promise<void> {
  const accounts = await getSavedAccounts();
  const filtered = accounts.filter(a => a.email !== email);
  await SecureStore.setItemAsync(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(filtered));
}

export async function trySilentLogin(email: string): Promise<{ user: User; tokens: AuthTokens } | null> {
  const accounts = await getSavedAccounts();
  const account = accounts.find(a => a.email === email);
  if (!account?.refresh_token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${account.refresh_token}`,
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token && data.user) {
      return { user: data.user, tokens: { jwt: data.token, refresh_token: data.refresh_token } };
    }
    return null;
  } catch { return null; }
}

export async function saveUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function getSavedUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.token) {
      cachedJwt = data.token;
      await SecureStore.setItemAsync(STORAGE_KEYS.JWT, data.token);
      if (data.refresh_token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  _retry = false
): Promise<T> {
  const jwt = await getJwt();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !_retry) {
    // Try to refresh the token
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken();
    }

    const newJwt = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newJwt) {
      // Retry the request with the new token
      return apiRequest<T>(path, options, true);
    }

    // Refresh failed — clear tokens
    cachedJwt = null;
    await clearTokens();
    throw new AuthError('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(err.error || 'Request failed', res.status);
  }

  return res.json();
}

export class AuthError extends Error {
  constructor(msg: string) { super(msg); this.name = 'AuthError'; }
}

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg); this.name = 'ApiError'; this.status = status;
  }
}
