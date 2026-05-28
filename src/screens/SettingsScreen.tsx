import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW } from '../constants/theme';
import { formatCurrency } from '../utils/format';
import { API_BASE_URL } from '../constants/api';

export function SettingsScreen() {
  const { user, logout, getAccessToken } = useAuth();
  const { colors, isDark, preference, setPreference } = useTheme();

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'خروج', style: 'destructive',
        onPress: async () => {
          try { await logout(); } catch {}
        },
      },
    ]);
  };

  const toggleDarkMode = (value: boolean) => {
    setPreference(value ? 'dark' : 'light');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Account Info */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>حساب المتجر</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>الاسم</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.name || '—'}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>البريد الإلكتروني</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || '—'}</Text>
        </View>
        {user?.store_name && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>اسم المتجر</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.store_name}</Text>
            </View>
          </>
        )}
        {user?.phone && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>الهاتف</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user.phone}</Text>
            </View>
          </>
        )}
      </View>

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>المظهر</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>الوضع الداكن</Text>
            <Text style={[styles.settingHint, { color: colors.textMuted }]}>
              {preference === 'system' ? 'يتبع إعدادات الجهاز' : isDark ? 'مفعّل' : 'معطّل'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDark ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Store Link */}
      {user?.store_slug && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>رابط المتجر</Text>
          <Text style={[styles.storeUrl, { color: colors.primary }]}>
            sahla4eco.com/{user.store_slug}
          </Text>
        </View>
      )}

      {/* App Info */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>عن التطبيق</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>الإصدار</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>المنصة</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>Sahla4Eco</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: RADIUS.md, padding: 16,
    marginBottom: 12, ...SHADOW.card,
  },
  cardTitle: { fontSize: FONT.xs, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: FONT.sm, fontWeight: '500' },
  infoValue: { fontSize: FONT.md, fontWeight: '600' },
  divider: { height: 1, marginVertical: 4 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FONT.md, fontWeight: '600' },
  settingHint: { fontSize: FONT.xs, marginTop: 2 },
  storeUrl: { fontSize: FONT.md, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  logoutBtn: {
    borderRadius: RADIUS.md, padding: 16, alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: '#fff', fontSize: FONT.lg, fontWeight: '700' },
});
