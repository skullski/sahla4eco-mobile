import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { OrderRow } from '../components/OrderRow';
import { COLORS, RADIUS, FONT } from '../constants/theme';
import { getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';
import type { MobileOrder } from '../types';

const FILTERS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function OrdersScreen({ navigation }: any) {
  const { getAccessToken } = useAuth();
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const token = await getAccessToken();
    if (!token) throw new Error('No auth token');
    return fetch(url, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    });
  }, [getAccessToken]);

  const fetchOrders = useCallback(async (status?: string) => {
    try {
      const baseUrl = API_BASE_URL;
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const res = await authFetch(`${baseUrl}/api/mobile/orders${query}`);
      if (res.ok) setOrders(await res.json());
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useFocusEffect(useCallback(() => { fetchOrders(activeFilter); }, [activeFilter, fetchOrders]));

  const handleFilter = (f: string) => {
    setActiveFilter(f);
    setLoading(true);
    fetchOrders(f);
  };

  const handleConfirm = async (order: MobileOrder) => {
    try {
      const baseUrl = API_BASE_URL;
      await authFetch(`${baseUrl}/api/mobile/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      fetchOrders(activeFilter);
    } catch {}
  };

  const handleCancel = async (order: MobileOrder) => {
    Alert.alert('إلغاء الطلب', `هل أنت متأكد من إلغاء طلب ${order.customer_name}؟`, [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'إلغاء', style: 'destructive',
        onPress: async () => {
          try {
            const baseUrl = API_BASE_URL;
            await authFetch(`${baseUrl}/api/mobile/orders/${order.id}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'cancelled' }),
            });
            fetchOrders(activeFilter);
          } catch {}
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeFilter === item && styles.chipActive]}
              onPress={() => handleFilter(item)}
            >
              <Text style={[styles.chipText, activeFilter === item && styles.chipTextActive]}>
                {getStatusLabel(item === 'all' ? 'الكل' : item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(activeFilter); }} />
        }
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
            onConfirm={item.status === 'pending' ? () => handleConfirm(item) : undefined}
            onCancel={item.status === 'pending' || item.status === 'confirmed' ? () => handleCancel(item) : undefined}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>لا توجد طلبات</Text>
            <Text style={styles.emptyHint}>اسحب لأسفل للتحديث</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  filters: { paddingVertical: 8, backgroundColor: COLORS.background },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textSecondary },
  emptyHint: { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 4 },
});
