import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import { useColors } from '../contexts/ThemeContext';
import { useNotif } from '../hooks/usePushNotifications';
import { RADIUS, FONT } from '../constants/theme';
import { formatCurrency, formatTimeAgo } from '../utils/format';
import { API_BASE_URL } from '../constants/api';

export function DashboardScreen({ navigation }: any) {
  const { user, getAccessToken } = useAuth();
  const colors = useColors();
  const { unreadCount } = useNotif();
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.text }]}>مرحباً، {user?.name || 'المالك'}</Text>
          <Text style={[styles.storeName, { color: colors.textSecondary }]}>
            {user?.store_name || 'Sahla4Eco'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bellWrap, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="إيرادات اليوم"
            value={formatCurrency(stats?.today_revenue || 0)}
            color={colors.success}
            icon="wallet-outline"
          />
          <View style={{ width: 10 }} />
          <StatCard
            label="طلبات اليوم"
            value={String(stats?.today_orders || 0)}
            color={colors.primary}
            icon="receipt-outline"
          />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.statsRow}>
          <StatCard
            label="قيد الانتظار"
            value={String(stats?.pending_count || 0)}
            color={colors.warning}
            icon="time-outline"
          />
          <View style={{ width: 10 }} />
          <StatCard
            label="مخزون منخفض"
            value={String(stats?.low_stock || 0)}
            color={colors.danger}
            icon="alert-circle-outline"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>الوصول السريع</Text>
      </View>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => navigation.navigate('OrdersTab')}
        >
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <Text style={[styles.quickLabel, { color: colors.primary }]}>الطلبات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.warningLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Orders', params: { status: 'pending' } })}
        >
          <Ionicons name="time-outline" size={20} color={colors.warning} />
          <Text style={[styles.quickLabel, { color: colors.warning }]}>المعلقة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.successLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Orders', params: { status: 'delivered' } })}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={[styles.quickLabel, { color: colors.success }]}>المسلّمة</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>آخر الطلبات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      {recentOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="receipt-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>لا توجد طلبات بعد</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>عند وصول طلب جديد، ستراه هنا فوراً</Text>
        </View>
      ) : (
        recentOrders.map((o: any) => (
          <TouchableOpacity
            key={o.id}
            style={[styles.recentRow, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { id: o.id } })}
          >
            <View style={styles.recentLeft}>
              <View style={[styles.recentAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.recentAvatarText, { color: colors.primary }]}>
                  {o.customer_name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.recentInfo}>
                <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>{o.customer_name}</Text>
                <Text style={[styles.recentProduct, { color: colors.textSecondary }]} numberOfLines={1}>{o.product_title}</Text>
              </View>
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
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FONT.xl, fontWeight: '800' },
  storeName: { fontSize: FONT.sm, marginTop: 2 },
  bellWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 } as any) },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  statsGrid: { marginBottom: 8 },
  statsRow: { flexDirection: 'row' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700' },
  seeAll: { fontSize: FONT.sm, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  quickBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: RADIUS.lg },
  quickLabel: { fontSize: FONT.xs, fontWeight: '700' },
  recentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: RADIUS.lg, marginBottom: 6,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  recentAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  recentAvatarText: { fontSize: FONT.md, fontWeight: '800' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: FONT.md, fontWeight: '700' },
  recentProduct: { fontSize: FONT.xs, marginTop: 1 },
  recentMeta: { alignItems: 'flex-end' },
  recentAmount: { fontSize: FONT.sm, fontWeight: '700' },
  recentTime: { fontSize: FONT.xs, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyText: { fontSize: FONT.md, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 4, textAlign: 'center' },
});
