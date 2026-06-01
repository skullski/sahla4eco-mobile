import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT } from '../constants/theme';
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

  const sourceIcon:
    | 'hardware-chip-outline'
    | 'paper-plane-outline'
    | 'chatbubble-outline'
    | 'globe-outline' =
    order.order_source === 'ai_customer' ? 'hardware-chip-outline' :
    order.source_platform === 'telegram' ? 'paper-plane-outline' :
    order.source_platform === 'messenger' ? 'chatbubble-outline' :
    'globe-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.wrapper, { backgroundColor: colors.card }]}
    >
      <View style={styles.leftAccent}>
        <View style={[styles.accentBar, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <View style={[styles.avatar, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.avatarText, { color: statusColor }]}>
                {order.customer_name?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.nameInfo}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {order.customer_name}
              </Text>
              <Text style={[styles.product, { color: colors.textSecondary }]} numberOfLines={1}>
                {order.product_title}
              </Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '12' }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.status, { color: statusColor }]}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Ionicons name={sourceIcon} size={11} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {order.order_source_label || order.source_platform_label || ''}
            </Text>
            {order.delivery_type === 'desk' && (
              <>
                <Text style={[styles.metaSep, { color: colors.border }]}>|</Text>
                <Ionicons name="business-outline" size={11} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>مكتب</Text>
              </>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(order.total_price, order.currency)}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{formatTimeAgo(order.created_at)}</Text>
          </View>
        </View>

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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftAccent: { width: 4 },
  accentBar: { flex: 1, borderTopLeftRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.lg },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingRight: 12,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  avatar: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { fontSize: FONT.sm, fontWeight: '800' },
  nameInfo: { flex: 1 },
  name: { fontSize: FONT.md, fontWeight: '700' },
  product: { fontSize: FONT.xs, marginTop: 1 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 3 },
  status: { fontSize: 10, fontWeight: '600' },
  bottomRow: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  metaText: { fontSize: FONT.xs, fontWeight: '500' },
  metaSep: { fontSize: FONT.xs },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: FONT.md, fontWeight: '700' },
  time: { fontSize: FONT.xs },
  actions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  actionBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: FONT.sm, fontWeight: '700' },
});
