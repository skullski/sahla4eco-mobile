import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Linking, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useColors, useTheme } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency, formatDate, getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';
import type { OrderDetail } from '../types';

export function OrderDetailScreen({ route }: any) {
  const { id } = route.params;
  const { getAccessToken } = useAuth();
  const colors = useColors();
  const { isDark } = useTheme();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const baseUrl = API_BASE_URL;

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      fetch(`${baseUrl}/api/mobile/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    })();
  }, [id, baseUrl, getAccessToken]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(`${baseUrl}/api/mobile/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const refreshed = await fetch(`${baseUrl}/api/mobile/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setOrder(refreshed);
      } else {
        const err = await res.json().catch(() => ({ error: 'فشل التحديث' }));
        Alert.alert('خطأ', err.error || 'فشل تحديث حالة الطلب');
      }
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم');
    } finally {
      setUpdating(false);
    }
  };

  const callCustomer = () => {
    if (order?.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    }
  };

  const whatsappCustomer = () => {
    if (order?.customer_phone) {
      Linking.openURL(`https://wa.me/${order.customer_phone.replace(/^0/, '213')}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: FONT.lg, color: colors.textSecondary }}>الطلب غير موجود</Text>
      </View>
    );
  }

  const statusColor =
    order.status === 'delivered' || order.status === 'confirmed' ? colors.success :
    order.status === 'cancelled' || order.status === 'returned' || order.status === 'fake' ? colors.danger :
    order.status === 'pending' ? colors.warning : colors.primary;

  const statusActions: { label: string; status: string; color: string }[] = [];
  if (order.status === 'pending') {
    statusActions.push({ label: 'تأكيد', status: 'confirmed', color: colors.success });
    statusActions.push({ label: 'إلغاء', status: 'cancelled', color: colors.danger });
  } else if (order.status === 'confirmed') {
    statusActions.push({ label: 'شحن', status: 'shipped', color: colors.info });
    statusActions.push({ label: 'إلغاء', status: 'cancelled', color: colors.danger });
  } else if (order.status === 'shipped') {
    statusActions.push({ label: 'توصيل', status: 'delivered', color: colors.success });
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusLabel(order.status)}
        </Text>
      </View>

      {/* Customer Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>العميل</Text>
        <Text style={[styles.customerName, { color: colors.text }]}>{order.customer_name}</Text>
        <TouchableOpacity style={styles.phoneRow} onPress={callCustomer}>
          <Text style={styles.phoneIcon}>📞</Text>
          <Text style={[styles.phone, { color: colors.primary }]}>{order.customer_phone}</Text>
        </TouchableOpacity>
        {order.address && <Text style={[styles.address, { color: colors.textSecondary }]}>🏠 {order.address}</Text>}
      </View>

      {/* Product Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>المنتج</Text>
        <Text style={[styles.productName, { color: colors.text }]}>{order.product_title}</Text>
        {order.variant_name && (
          <Text style={[styles.variant, { color: colors.textSecondary }]}>📎 {order.variant_name}</Text>
        )}
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>الكمية: {order.quantity}</Text>
        <View style={[styles.priceRow, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>المجموع</Text>
          <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(order.total_price, order.currency)}</Text>
        </View>
      </View>

      {/* Order Info Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>مصدر الطلب</Text>
        <Text style={[styles.infoRow, { color: colors.text }]}>
          {order.order_source === 'ai_customer' ? '🤖' : '📝'} {order.order_source_label || order.order_source}
        </Text>
        {order.source_platform_label && (
          <Text style={[styles.infoRow, { color: colors.text }]}>
            {order.source_platform === 'telegram' ? '✈️' : order.source_platform === 'messenger' ? '💬' : '🌐'} {order.source_platform_label}
          </Text>
        )}
        {order.delivery_type && (
          <Text style={[styles.infoRow, { color: colors.text }]}>🚚 {order.delivery_type === 'desk' ? 'توصيل إلى المكتب' : 'توصيل إلى المنزل'}</Text>
        )}
        {order.tracking_number && (
          <Text style={[styles.infoRow, { color: colors.text }]}>📦 رقم التتبع: {order.tracking_number}</Text>
        )}
      </View>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>آخر التحديثات</Text>
          {order.timeline.map((t: any, i: number) => (
            <View key={i} style={[styles.timelineItem, t.active && styles.timelineActive]}>
              <View style={[styles.timelineDot, { backgroundColor: t.active ? statusColor : colors.border }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, { color: colors.text }, t.active && { fontWeight: '700' }]}>{t.label}</Text>
                <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{formatDate(t.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {statusActions.length > 0 && (
        <View style={styles.actions}>
          {statusActions.map((a) => (
            <TouchableOpacity
              key={a.status}
              style={[styles.actionBtn, { backgroundColor: a.color }]}
              onPress={() => updateStatus(a.status)}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>{a.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Customer Contact */}
      <View style={styles.contactRow}>
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.successLight }]} onPress={whatsappCustomer}>
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={[styles.contactLabel, { color: colors.success }]}>واتساب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.primaryLight }]} onPress={callCustomer}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={[styles.contactLabel, { color: colors.primary }]}>اتصال</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: RADIUS.md, marginBottom: 12, gap: 8,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: FONT.md, fontWeight: '700' },
  card: {
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 12, ...SHADOW.card,
  },
  cardTitle: { fontSize: FONT.xs, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  customerName: { fontSize: FONT.lg, fontWeight: '700', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  phoneIcon: { fontSize: 16 },
  phone: { fontSize: FONT.md, fontWeight: '600' },
  address: { fontSize: FONT.sm, marginTop: 4 },
  productName: { fontSize: FONT.lg, fontWeight: '700', marginBottom: 4 },
  variant: { fontSize: FONT.sm, marginBottom: 4 },
  quantity: { fontSize: FONT.sm, marginBottom: 8 },
  infoRow: { fontSize: FONT.sm, marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1 },
  priceLabel: { fontSize: FONT.sm, fontWeight: '600' },
  price: { fontSize: FONT.xl, fontWeight: '800' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  timelineActive: {},
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: FONT.sm },
  timelineTime: { fontSize: FONT.xs, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOW.button },
  actionBtnText: { color: '#fff', fontSize: FONT.md, fontWeight: '700' },
  contactRow: { flexDirection: 'row', gap: 8 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: RADIUS.md },
  contactIcon: { fontSize: 18 },
  contactLabel: { fontSize: FONT.md, fontWeight: '700' },
});
