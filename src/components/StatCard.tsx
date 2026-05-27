import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT, SHADOW, SPACING } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export function StatCard({ label, value, color = COLORS.primary, icon }: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW.card,
    minHeight: 90,
    justifyContent: 'center',
  },
  icon: { fontSize: 20, marginBottom: 2 },
  value: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: FONT.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
