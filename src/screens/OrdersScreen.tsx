import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { OrderRow } from '../components/OrderRow';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT } from '../constants/theme';
import { getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';
import type { MobileOrder } from '../types';

const FILTERS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function OrdersScreen({ navigation }: any) {
  const { getAccessToken } = useAuth();
  const colors = useColors();
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const updateStatus = async (order: MobileOrder, status: string) => {
    setUpdatingId(order.id);
    try {
      const baseUrl = API_BASE_URL;
      const token = await getAccessToken();
      const res = await fetch(`${baseUrl}/api/mobile/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'فشل التحديث' }));
        Alert.alert('خطأ', err.error || 'فشل تحديث حالة الطلب');
      } else {
        fetchOrders(activeFilter);
      }
    } catch (e: any) {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirm = (order: MobileOrder) => updateStatus(order, 'confirmed');

  const handleCancel = (order: MobileOrder) => {
    Alert.alert('إلغاء الطلب', `هل أنت متأكد من إلغاء طلب ${order.customer_name}؟`, [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'إلغاء', style: 'destructive',
        onPress: () => updateStatus(order, 'cancelled'),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filters, { backgroundColor: colors.background }]}>
        <View style={styles.filterWrap}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeFilter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleFilter(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  activeFilter === f && { color: '#fff' },
                ]}
              >
                {getStatusLabel(f === 'all' ? 'الكل' : f)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
            updating={updatingId === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>لا توجد طلبات</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>اسحب لأسفل للتحديث</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { paddingVertical: 8 },
  filterWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipText: { fontSize: FONT.xs, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: FONT.lg, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 4 },
});
