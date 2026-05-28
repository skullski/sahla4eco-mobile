import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW, SPACING } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  trend?: { value: number; positive: boolean };
}

export function StatCard({ label, value, color: propColor, icon, trend }: Props) {
  const colors = useColors();
  const color = propColor || colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: color + '12' }]}>
          {icon && <Ionicons name={icon} size={18} color={color} />}
        </View>
        {trend && (
          <View style={[styles.trend, { backgroundColor: trend.positive ? colors.successLight : colors.dangerLight }]}>
            <Ionicons
              name={trend.positive ? 'trending-up' : 'trending-down'}
              size={10}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  trendText: { fontSize: 10, fontWeight: '700' },
  value: { fontSize: FONT.xxl, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: FONT.xs, fontWeight: '600', marginTop: 2 },
});
