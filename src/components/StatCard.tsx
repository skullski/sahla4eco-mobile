import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT, SPACING } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  trend?: { value: number; positive: boolean };
  gradient?: boolean;
}

export function StatCard({ label, value, color: propColor, icon, trend, gradient }: Props) {
  const colors = useColors();
  const color = propColor || colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
          {icon && <Ionicons name={icon} size={16} color={color} />}
        </View>
        {trend && (
          <View style={[styles.trend, { backgroundColor: trend.positive ? colors.successLight : colors.dangerLight }]}>
            <Ionicons
              name={trend.positive ? 'trending-up' : 'trending-down'}
              size={9}
              color={trend.positive ? colors.success : colors.danger}
            />
            <Text style={[styles.trendText, { color: trend.positive ? colors.success : colors.danger }]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {gradient && (
        <View style={[styles.gradientBar, { backgroundColor: color + '20' }]}>
          <View style={[styles.gradientFill, { backgroundColor: color, width: '60%' }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: RADIUS.full },
  trendText: { fontSize: 9, fontWeight: '700' },
  value: { fontSize: FONT.xxl, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: FONT.xs, fontWeight: '600', marginTop: 2 },
  gradientBar: { height: 3, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  gradientFill: { height: '100%', borderRadius: 2 },
});
