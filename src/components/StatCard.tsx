import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW, SPACING } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export function StatCard({ label, value, color: propColor, icon }: Props) {
  const colors = useColors();
  const color = propColor || colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderLeftColor: color, borderLeftWidth: 3 }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.card,
    minHeight: 90,
    justifyContent: 'center',
  },
  icon: { fontSize: 20, marginBottom: 2 },
  value: { fontSize: FONT.xxl, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: FONT.xs, fontWeight: '600', marginTop: 2 },
});
