import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { OrderRow } from '../components/OrderRow';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT } from '../constants/theme';
import { getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';
import type { MobileOrder } from '../types';

const FILTERS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const FILTER_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  all: 'grid-outline',
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  shipped: 'car-outline',
  delivered: 'bag-check-outline',
  cancelled: 'close-circle-outline',
};

export function OrdersScreen({ navigation, route }: any) {
  const { getAccessToken } = useAuth();
  const colors = useColors();
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(route?.params?.status || 'all');
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

  useFocusEffect(useCallback(() => {
    if (route?.params?.status) {
      setActiveFilter(route.params.status);
    }
    fetchOrders(activeFilter);
  }, [activeFilter, fetchOrders]));

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
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirm = (order: MobileOrder) => updateStatus(order, 'confirmed');

  const handleCancel = (order: MobileOrder) => {
    Alert.alert('إلغاء الطلب', `هل أنت متأكد من إلغاء طلب ${order.customer_name}؟`, [
      { text: 'تراجع', style: 'cancel' },
      { text: 'إلغاء', style: 'destructive', onPress: () => updateStatus(order, 'cancelled') },
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
      {/* Filters */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeFilter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleFilter(f)}
            >
              <Ionicons
                name={FILTER_ICONS[f] || 'ellipse-outline'}
                size={14}
                color={activeFilter === f ? '#fff' : colors.textSecondary}
              />
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
          )}
        />
      </View>

      {/* Orders count */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(activeFilter); }} tintColor={colors.primary} />
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
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>لا توجد طلبات</Text>
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
  filters: { paddingTop: 8 },
  filterList: { paddingHorizontal: 16, gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  chipText: { fontSize: FONT.xs, fontWeight: '600' },
  countRow: { paddingHorizontal: 16, paddingVertical: 6 },
  countText: { fontSize: FONT.xs, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyText: { fontSize: FONT.lg, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 4 },
});
