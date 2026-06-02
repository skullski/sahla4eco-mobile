import { API_BASE_URL, STORAGE_KEYS } from '../constants/api';
import { setTokens, saveUser, clearTokens } from './client';
import type { AuthTokens, User } from '../types';

function getBaseUrl(): string {
  return 'https://www.sahla4eco.com';
}

async function apiPost<T>(path: string, body: any, jwt?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function apiGet<T>(path: string, jwt: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiPost<{ token: string; refresh_token?: string; user: User }>('/api/auth/login', {
    email, password,
  });
  const tokens: AuthTokens = { jwt: data.token, refresh_token: data.refresh_token };
  await setTokens(tokens);
  await saveUser(data.user);
  return { user: data.user, tokens };
}

export async function requestQRToken(jwt: string): Promise<{ qr_token: string; expires_in: number }> {
  return apiPost('/api/auth/qr-request', {}, jwt);
}

export async function loginWithQR(qrToken: string): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiPost<{ token: string; refresh_token?: string; user: User }>('/api/auth/qr-login', {
    qr_token: qrToken,
  });
  const tokens: AuthTokens = { jwt: data.token, refresh_token: data.refresh_token };
  await setTokens(tokens);
  await saveUser(data.user);
  return { user: data.user, tokens };
}

export async function fetchDashboardStats(jwt: string): Promise<{
  today_revenue: number; today_orders: number; pending_count: number; low_stock: number;
}> {
  return apiGet('/api/mobile/stats', jwt);
}

export async function fetchOrders(jwt: string, status?: string): Promise<any[]> {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  return apiGet(`/api/mobile/orders${query}`, jwt);
}

export async function fetchOrderDetail(jwt: string, id: number): Promise<any> {
  return apiGet(`/api/mobile/orders/${id}`, jwt);
}

export async function updateOrderStatus(
  jwt: string, id: number, status: string
): Promise<void> {
  await apiPost(`/api/mobile/orders/${id}/status`, { status }, jwt);
}

export async function registerPushToken(jwt: string, pushToken: string, platform: string): Promise<void> {
  await apiPost('/api/notifications/register-device', { push_token: pushToken, platform }, jwt);
}

export async function unregisterPushToken(jwt: string, pushToken: string): Promise<void> {
  await apiPost('/api/notifications/unregister-device', { push_token: pushToken }, jwt);
}

export async function fetchNotifications(jwt: string): Promise<any[]> {
  return apiGet('/api/mobile/notifications', jwt);
}

export async function markNotificationsRead(jwt: string): Promise<void> {
  await apiPost('/api/mobile/notifications/read-all', {}, jwt);
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export async function loginWithGoogle(idToken: string): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiPost<{ token: string; refresh_token?: string; user: User }>('/api/auth/google', {
    id_token: idToken,
  });
  const tokens: AuthTokens = { jwt: data.token, refresh_token: data.refresh_token };
  await setTokens(tokens);
  await saveUser(data.user);
  return { user: data.user, tokens };
}
