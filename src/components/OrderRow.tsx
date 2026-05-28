import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency, formatTimeAgo, getStatusLabel } from '../utils/format';
import type { MobileOrder } from '../types';

interface Props {
  order: MobileOrder;
  onPress: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  updating?: boolean;
}

export function OrderRow({ order, onPress, onConfirm, onCancel, updating }: Props) {
  const colors = useColors();

  const statusColor =
    order.status === 'delivered' || order.status === 'confirmed' ? colors.success :
    order.status === 'cancelled' || order.status === 'returned' || order.status === 'fake' ? colors.danger :
    order.status === 'pending' ? colors.warning : colors.primary;

  const sourceIcon =
    order.order_source === 'ai_customer' ? 'hardware-chip-outline' as const :
    order.source_platform === 'telegram' ? 'paper-plane-outline' as const :
    order.source_platform === 'messenger' ? 'chatbubble-outline' as const :
    'globe-outline' as const;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{order.customer_name}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.status, { color: statusColor }]}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        <Text style={[styles.product, { color: colors.textSecondary }]} numberOfLines={1}>{order.product_title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.sourceBadge}>
            <Ionicons name={sourceIcon} size={12} color={colors.textMuted} />
            <Text style={[styles.sourceText, { color: colors.textMuted }]}>{order.order_source_label || order.source_platform_label || ''}</Text>
          </View>
          {order.delivery_type === 'desk' && (
            <View style={styles.sourceBadge}>
              <Ionicons name="business-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.sourceText, { color: colors.textMuted }]}>مكتب</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(order.total_price, order.currency)}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{formatTimeAgo(order.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {(onConfirm || onCancel) && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          {onConfirm && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.success }]}
              onPress={onConfirm}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionText}>تأكيد</Text>
              )}
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.danger }]}
              onPress={onCancel}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionText}>إلغاء</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  touchable: { padding: 14 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { fontSize: FONT.md, fontWeight: '700', flex: 1, marginRight: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  status: { fontSize: FONT.xs, fontWeight: '600' },
  product: { fontSize: FONT.sm, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, backgroundColor: 'rgba(0,0,0,0.03)' },
  sourceText: { fontSize: FONT.xs, fontWeight: '500' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: FONT.md, fontWeight: '700' },
  time: { fontSize: FONT.xs },
  actions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  actionBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: FONT.sm, fontWeight: '700' },
});
