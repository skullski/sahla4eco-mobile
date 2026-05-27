import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Linking, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency, formatDate, getStatusLabel } from '../utils/format';
import { API_BASE_URL } from '../constants/api';
import type { OrderDetail } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning, confirmed: COLORS.primary, processing: COLORS.info,
  shipped: COLORS.success, delivered: COLORS.success, cancelled: COLORS.danger,
};

export function OrderDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { getAccessToken } = useAuth();
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
        // Refetch order detail to get updated status + timeline
        const refreshed = await fetch(`${baseUrl}/api/mobile/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setOrder(refreshed);
      }
    } catch {} finally {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: FONT.lg, color: COLORS.textSecondary }}>الطلب غير موجود</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || COLORS.primary;
  const statusActions: { label: string; status: string; color: string }[] = [];
  if (order.status === 'pending') {
    statusActions.push({ label: 'تأكيد', status: 'confirmed', color: COLORS.success });
    statusActions.push({ label: 'إلغاء', status: 'cancelled', color: COLORS.danger });
  } else if (order.status === 'confirmed') {
    statusActions.push({ label: 'شحن', status: 'shipped', color: COLORS.info });
    statusActions.push({ label: 'إلغاء', status: 'cancelled', color: COLORS.danger });
  } else if (order.status === 'shipped') {
    statusActions.push({ label: 'توصيل', status: 'delivered', color: COLORS.success });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusLabel(order.status)}
        </Text>
      </View>

      {/* Customer Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>العميل</Text>
        <Text style={styles.customerName}>{order.customer_name}</Text>
        <TouchableOpacity style={styles.phoneRow} onPress={callCustomer}>
          <Text style={styles.phoneIcon}>📞</Text>
          <Text style={styles.phone}>{order.customer_phone}</Text>
        </TouchableOpacity>
        {order.address && <Text style={styles.address}>🏠 {order.address}</Text>}
      </View>

      {/* Product Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>المنتج</Text>
        <Text style={styles.productName}>{order.product_title}</Text>
        {order.variant_name && (
          <Text style={styles.variant}>📎 {order.variant_name}</Text>
        )}
        <Text style={styles.quantity}>الكمية: {order.quantity}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>المجموع</Text>
          <Text style={styles.price}>{formatCurrency(order.total_price, order.currency)}</Text>
        </View>
      </View>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>آخر التحديثات</Text>
          {order.timeline.map((t: any, i: number) => (
            <View key={i} style={[styles.timelineItem, t.active && styles.timelineActive]}>
              <View style={[styles.timelineDot, t.active && { backgroundColor: statusColor }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, t.active && { fontWeight: '700' }]}>{t.label}</Text>
                <Text style={styles.timelineTime}>{formatDate(t.timestamp)}</Text>
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
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.successLight }]} onPress={whatsappCustomer}>
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={[styles.contactLabel, { color: COLORS.success }]}>واتساب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.primaryLight }]} onPress={callCustomer}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={[styles.contactLabel, { color: COLORS.primary }]}>اتصال</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: RADIUS.md, marginBottom: 12, gap: 8,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: FONT.md, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 16,
    marginBottom: 12, ...SHADOW.card,
  },
  cardTitle: { fontSize: FONT.xs, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  customerName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  phoneIcon: { fontSize: 16 },
  phone: { fontSize: FONT.md, color: COLORS.primary, fontWeight: '600' },
  address: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 4 },
  productName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  variant: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 4 },
  quantity: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  priceLabel: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSecondary },
  price: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.text },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  timelineActive: {},
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: FONT.sm, color: COLORS.text },
  timelineTime: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOW.button },
  actionBtnText: { color: '#fff', fontSize: FONT.md, fontWeight: '700' },
  contactRow: { flexDirection: 'row', gap: 8 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: RADIUS.md },
  contactIcon: { fontSize: 18 },
  contactLabel: { fontSize: FONT.md, fontWeight: '700' },
});
