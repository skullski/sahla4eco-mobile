import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
  Switch, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, RADIUS, FONT, SPACING } from '../constants/theme';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [biometric, setBiometric] = useState(false);

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'تراجع', style: 'cancel' },
      { text: 'تسجيل الخروج', style: 'destructive', onPress: logout },
    ]);
  };

  const openDashboard = () => {
    if (user?.store_slug) {
      Linking.openURL(`https://sahla4eco.onrender.com/login`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Store Info */}
      <View style={styles.card}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeIcon}>🛒</Text>
          <View>
            <Text style={styles.storeName}>{user?.store_name || 'متجري'}</Text>
            <Text style={styles.storeSlug}>@{user?.store_slug || '...'}</Text>
          </View>
        </View>
        <Text style={styles.ownerName}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>بصمة الوجه</Text>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={biometric ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.settingRow} onPress={openDashboard}>
          <Text style={styles.settingLabel}>فتح لوحة التحكم الكاملة</Text>
          <Text style={styles.linkIcon}>🌐</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://sahla4eco.com/contact')}>
          <Text style={styles.settingLabel}>الدعم الفني</Text>
          <Text style={styles.linkIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>حول التطبيق</Text>
        <Text style={styles.aboutText}>Sahla4Eco Mobile v1.0.0</Text>
        <Text style={styles.aboutText}>تطبيق لإدارة متجرك بسرعة وسهولة</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
  },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  storeIcon: { fontSize: 32 },
  storeName: { fontSize: FONT.lg, fontWeight: '800', color: COLORS.text },
  storeSlug: { fontSize: FONT.sm, color: COLORS.textSecondary },
  ownerName: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  email: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: FONT.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLabel: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  linkIcon: { fontSize: 20 },
  aboutText: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: 2 },
  logoutBtn: {
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.danger,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { fontSize: FONT.md, fontWeight: '700', color: COLORS.danger },
});
