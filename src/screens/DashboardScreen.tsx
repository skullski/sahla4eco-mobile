import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT } from '../constants/theme';
import { formatCurrency, formatTimeAgo } from '../utils/format';
import { API_BASE_URL } from '../constants/api';

export function DashboardScreen({ navigation }: any) {
  const { user, getAccessToken } = useAuth();
  const colors = useColors();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const baseUrl = API_BASE_URL;
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${baseUrl}/api/mobile/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/mobile/orders?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setRecentOrders(await ordersRes.json());
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAccessToken]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome */}
      <Text style={[styles.greeting, { color: colors.text }]}>مرحباً، {user?.name || 'المالك'}</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="إيرادات اليوم"
            value={formatCurrency(stats?.today_revenue || 0)}
            color={colors.success}
            icon="💰"
          />
          <View style={{ width: 8 }} />
          <StatCard
            label="طلبات اليوم"
            value={String(stats?.today_orders || 0)}
            color={colors.primary}
            icon="📦"
          />
        </View>
        <View style={{ height: 8 }} />
        <View style={styles.statsRow}>
          <StatCard
            label="قيد الانتظار"
            value={String(stats?.pending_count || 0)}
            color={colors.warning}
            icon="⏳"
          />
          <View style={{ width: 8 }} />
          <StatCard
            label="مخزون منخفض"
            value={String(stats?.low_stock || 0)}
            color={colors.danger}
            icon="📉"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => navigation.navigate('OrdersTab')}
        >
          <Text style={styles.quickIcon}>📋</Text>
          <Text style={[styles.quickLabel, { color: colors.primary }]}>الطلبات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.successLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Orders', params: { status: 'pending' } })}
        >
          <Text style={styles.quickIcon}>⏳</Text>
          <Text style={[styles.quickLabel, { color: colors.success }]}>المعلقة</Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>آخر الطلبات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      {recentOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>لا توجد طلبات بعد</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>عند وصول طلب جديد، ستراه هنا فوراً</Text>
        </View>
      ) : (
        recentOrders.map((o: any) => (
          <TouchableOpacity
            key={o.id}
            style={[styles.recentRow, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { id: o.id } })}
          >
            <View style={styles.recentInfo}>
              <Text style={[styles.recentName, { color: colors.text }]}>{o.customer_name}</Text>
              <Text style={[styles.recentProduct, { color: colors.textSecondary }]} numberOfLines={1}>{o.product_title}</Text>
            </View>
            <View style={styles.recentMeta}>
              <Text style={[styles.recentAmount, { color: colors.text }]}>{formatCurrency(o.total_price)}</Text>
              <Text style={[styles.recentTime, { color: colors.textMuted }]}>{formatTimeAgo(o.created_at)}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: FONT.xl, fontWeight: '800' },
  date: { fontSize: FONT.sm, marginTop: 2, marginBottom: 20 },
  statsGrid: { marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: RADIUS.md },
  quickIcon: { fontSize: 18 },
  quickLabel: { fontSize: FONT.sm, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700' },
  seeAll: { fontSize: FONT.sm, fontWeight: '600' },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: RADIUS.md, marginBottom: 6 },
  recentInfo: { flex: 1, marginRight: 12 },
  recentName: { fontSize: FONT.md, fontWeight: '700' },
  recentProduct: { fontSize: FONT.sm, marginTop: 2 },
  recentMeta: { alignItems: 'flex-end' },
  recentAmount: { fontSize: FONT.md, fontWeight: '700' },
  recentTime: { fontSize: FONT.xs, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: FONT.md, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 4, textAlign: 'center' },
});
