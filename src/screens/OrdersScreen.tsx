import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
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
  const [search, setSearch] = useState('');

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

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.trim().toLowerCase();
    return orders.filter(o =>
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.product_title || '').toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      (o.customer_phone || '').includes(q)
    );
  }, [orders, search]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={{ gap: 8, paddingHorizontal: 16, width: '100%' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: colors.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.skelAvatar, { backgroundColor: colors.border }]} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={[styles.skelLine, { backgroundColor: colors.border, width: '50%' }]} />
                  <View style={[styles.skelLine, { backgroundColor: colors.border, width: '70%' }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Inline header */}
      <View style={[styles.inlineHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.inlineTitle, { color: colors.text }]}>الطلبات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tracking')}>
          <Ionicons name="car-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="بحث باسم العميل، المنتج، رقم الطلب..."
          placeholderTextColor={colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => {
            const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length;
            return (
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
                  size={12}
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
                {count > 0 && (
                  <View style={[styles.chipCount, { backgroundColor: activeFilter === f ? 'rgba(255,255,255,0.2)' : colors.border }]}>
                    <Text style={[styles.chipCountText, { color: activeFilter === f ? '#fff' : colors.textMuted }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders list */}
      <FlatList
        data={filteredOrders}
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
              <Ionicons name={search ? 'search-outline' : 'receipt-outline'} size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {search ? 'لا توجد نتائج بحث' : 'لا توجد طلبات'}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
              {search ? 'جرّب كلمة بحث مختلفة' : 'اسحب لأسفل للتحديث'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inlineHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  inlineTitle: { fontSize: FONT.lg, fontWeight: '800' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    paddingHorizontal: 12, height: 40, borderRadius: RADIUS.md, borderWidth: 1,
  },
  searchInput: { flex: 1, paddingVertical: 0, fontSize: FONT.sm },
  filters: { paddingTop: 6 },
  filterList: { paddingHorizontal: 16, gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  chipText: { fontSize: 10, fontWeight: '600' },
  chipCount: { minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  chipCountText: { fontSize: 8, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyText: { fontSize: FONT.md, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 2 },
  skeleton: { marginHorizontal: 16, marginBottom: 8, borderRadius: RADIUS.lg, padding: 14 },
  skelAvatar: { width: 36, height: 36, borderRadius: 8 },
  skelLine: { height: 12, borderRadius: 4 },
});
