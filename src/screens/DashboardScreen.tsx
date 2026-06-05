/**
 * AGENT INSTRUCTIONS — DASHBOARD SCREEN
 * ----------------------------------------------------------------------------
 * Keep this BASIC. Show the store owner today's numbers at a glance —
 * today's revenue, today's orders, pending count, low stock. No charts,
 * no trends, no analytics drilldown (those belong in the platform).
 * Notifications is the hero feature; this screen is just a launchpad
 * to Orders, Tracking, Notifications.
 * ----------------------------------------------------------------------------
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/StatCard';
import { useColors } from '../contexts/ThemeContext';
import { useNotif } from '../hooks/usePushNotifications';
import { RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency, formatTimeAgo, getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';

export function DashboardScreen({ navigation }: any) {
  const { user, getAccessToken } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
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

  const getStatusColor = (status: string) => {
    if (status === 'delivered' || status === 'confirmed') return colors.success;
    if (status === 'cancelled' || status === 'returned' || status === 'fake') return colors.danger;
    if (status === 'pending') return colors.warning;
    return colors.primary;
  };

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header with gradient */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top + 4 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>مرحباً، {user?.name || 'المالك'}</Text>
            <Text style={styles.storeName}>Sahla4Eco</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('NotificationsTab')}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerOverlay} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="إيرادات اليوم"
            value={formatCurrency(stats?.today_revenue || 0)}
            color={colors.success}
            icon="wallet-outline"
            gradient
          />
          <View style={{ width: 10 }} />
          <StatCard
            label="طلبات اليوم"
            value={String(stats?.today_orders || 0)}
            color={colors.primary}
            icon="receipt-outline"
            gradient
          />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.statsRow}>
          <StatCard
            label="قيد الانتظار"
            value={String(stats?.pending_count || 0)}
            color={colors.warning}
            icon="time-outline"
            gradient
          />
          <View style={{ width: 10 }} />
          <StatCard
            label="مخزون منخفض"
            value={String(stats?.low_stock || 0)}
            color={colors.danger}
            icon="alert-circle-outline"
            gradient
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
          <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="receipt-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.primary }]}>الطلبات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.warningLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Orders', params: { status: 'pending' } })}
        >
          <View style={[styles.quickIconWrap, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="time-outline" size={18} color={colors.warning} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.warning }]}>المعلقة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.successLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Orders', params: { status: 'delivered' } })}
        >
          <View style={[styles.quickIconWrap, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.success }]}>المسلّمة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.infoLight }]}
          onPress={() => navigation.navigate('OrdersTab', { screen: 'Tracking' })}
        >
          <View style={[styles.quickIconWrap, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="car-outline" size={18} color={colors.info} />
          </View>
          <Text style={[styles.quickLabel, { color: colors.info }]}>التتبع</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>آخر الطلبات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      {recentOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="receipt-outline" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>لا توجد طلبات بعد</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>عند وصول طلب جديد، ستراه هنا</Text>
        </View>
      ) : (
        recentOrders.map((o: any, index: number) => {
          const sc = getStatusColor(o.status);
          return (
            <TouchableOpacity
              key={o.id}
              style={[styles.recentRow, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { id: o.id } })}
            >
              <View style={[styles.recentAccent, { backgroundColor: sc }]} />
              <View style={styles.recentBody}>
                <View style={styles.recentTop}>
                  <View style={styles.recentLeft}>
                    <View style={[styles.recentAvatar, { backgroundColor: sc + '15' }]}>
                      <Text style={[styles.recentAvatarText, { color: sc }]}>
                        {o.customer_name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>
                        {o.customer_name}
                      </Text>
                      <Text style={[styles.recentProduct, { color: colors.textSecondary }]} numberOfLines={1}>
                        {o.product_title}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.recentBadge, { backgroundColor: sc + '12' }]}>
                    <View style={[styles.recentDot, { backgroundColor: sc }]} />
                    <Text style={[styles.recentStatus, { color: sc }]}>{getStatusLabel(o.status)}</Text>
                  </View>
                </View>
                <View style={styles.recentMeta}>
                  <Text style={[styles.recentAmount, { color: colors.text }]}>
                    {formatCurrency(o.total_price)}
                  </Text>
                  <Text style={[styles.recentTime, { color: colors.textMuted }]}>
                    {formatTimeAgo(o.created_at)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 1,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FONT.md, fontWeight: '800', color: '#fff' },
  storeName: { fontSize: FONT.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  statsGrid: { paddingHorizontal: 16, marginTop: -16 },
  statsRow: { flexDirection: 'row' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700' },
  seeAll: { fontSize: FONT.sm, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 4 },
  quickBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: RADIUS.lg },
  quickIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '700' },
  recentRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 6,
    borderRadius: RADIUS.lg, overflow: 'hidden',
  },
  recentAccent: { width: 3 },
  recentBody: { flex: 1, padding: 12 },
  recentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  recentAvatar: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  recentAvatarText: { fontSize: FONT.sm, fontWeight: '800' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: FONT.md, fontWeight: '700' },
  recentProduct: { fontSize: FONT.xs, marginTop: 1 },
  recentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  recentDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 3 },
  recentStatus: { fontSize: 9, fontWeight: '600' },
  recentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentAmount: { fontSize: FONT.sm, fontWeight: '700' },
  recentTime: { fontSize: FONT.xs },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyText: { fontSize: FONT.md, fontWeight: '700' },
  emptyHint: { fontSize: FONT.sm, marginTop: 2 },
});
