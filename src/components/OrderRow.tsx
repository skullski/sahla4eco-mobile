import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder,
} from 'react-native';
import { COLORS, RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency, formatTimeAgo, getStatusLabel } from '../utils/format';
import type { MobileOrder } from '../types';

interface Props {
  order: MobileOrder;
  onPress: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function OrderRow({ order, onPress, onConfirm, onCancel }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: (_, g) => {
        const x = Math.max(-100, Math.min(100, g.dx));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > 60 && onConfirm) {
          Animated.spring(translateX, { toValue: 80, useNativeDriver: true }).start();
          onConfirm();
        } else if (g.dx < -60 && onCancel) {
          Animated.spring(translateX, { toValue: -80, useNativeDriver: true }).start();
          onCancel();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const statusColor =
    order.status === 'delivered' || order.status === 'confirmed' ? COLORS.success :
    order.status === 'cancelled' || order.status === 'returned' || order.status === 'fake' ? COLORS.danger :
    order.status === 'pending' ? COLORS.warning : COLORS.primary;

  return (
    <View style={styles.wrapper}>
      {/* Swipe hint backgrounds */}
      {onConfirm && (
        <View style={[styles.swipeAction, styles.confirmBg]}>
          <Text style={styles.swipeText}>✓ تأكيد</Text>
        </View>
      )}
      {onCancel && (
        <View style={[styles.swipeAction, styles.cancelBg, { right: 0 }]}>
          <Text style={styles.swipeText}>✕ إلغاء</Text>
        </View>
      )}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{order.customer_name}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
              <View style={[styles.dot, { backgroundColor: statusColor }]} />
              <Text style={[styles.status, { color: statusColor }]}>{getStatusLabel(order.status)}</Text>
            </View>
          </View>
          <Text style={styles.product} numberOfLines={1}>{order.product_title}</Text>
          <View style={styles.bottomRow}>
            <Text style={styles.amount}>{formatCurrency(order.total_price, order.currency)}</Text>
            <Text style={styles.time}>{formatTimeAgo(order.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  row: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    ...SHADOW.card,
  },
  touchable: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  status: {
    fontSize: FONT.xs,
    fontWeight: '600',
  },
  product: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  time: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  confirmBg: {
    left: 0,
    backgroundColor: COLORS.success,
  },
  cancelBg: {
    backgroundColor: COLORS.danger,
  },
  swipeText: {
    color: '#fff',
    fontSize: FONT.sm,
    fontWeight: '700',
  },
});
