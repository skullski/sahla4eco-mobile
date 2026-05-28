import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW } from '../constants/theme';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, preference, setPreference } = useTheme();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const checkForUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert('تحديث متاح', 'يوجد تحديث جديد. هل تريد تحميله الآن؟', [
          { text: 'لاحقاً', style: 'cancel' },
          {
            text: 'تحديث',
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch {
                Alert.alert('خطأ', 'فشل تحميل التحديث');
              }
            },
          },
        ]);
      } else {
        Alert.alert('أنت تستخدم أحدث إصدار');
      }
    } catch {
      Alert.alert('خطأ', 'تعذر التحقق من التحديثات');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: async () => { try { await logout(); } catch {} } },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.name?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'المالك'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
        </View>
      </View>

      {/* Store */}
      {user?.store_name && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="storefront-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.cardTitle, { color: colors.textMuted }]}>المتجر</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>الاسم</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{user.store_name}</Text>
          </View>
          {user?.store_slug && (
            <View style={styles.row}>
              <Ionicons name="link-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>الرابط</Text>
              <Text style={[styles.rowValue, { color: colors.primary }]}>sahla4eco.com/{user.store_slug}</Text>
            </View>
          )}
        </View>
      )}

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="color-palette-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>المظهر</Text>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.text} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>الوضع الداكن</Text>
              <Text style={[styles.settingHint, { color: colors.textMuted }]}>
                {preference === 'system' ? 'يتبع إعدادات الجهاز' : isDark ? 'مفعّل' : 'معطّل'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={(v) => setPreference(v ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDark ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>عن التطبيق</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>الإصدار</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>المنصة</Text>
          <Text style={[styles.rowValue, { color: colors.text }]}>Sahla4Eco</Text>
        </View>
      </View>

      {/* Check for Updates */}
      <TouchableOpacity
        style={[styles.updateBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={checkForUpdate}
        disabled={checkingUpdate}
      >
        {checkingUpdate ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
        )}
        <Text style={[styles.updateBtnText, { color: colors.primary }]}>
          {checkingUpdate ? 'جاري التحقق...' : 'التحقق من التحديثات'}
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.danger }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOW.card,
  },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FONT.xl, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FONT.lg, fontWeight: '700' },
  profileEmail: { fontSize: FONT.sm, marginTop: 1 },
  card: {
    borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOW.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontSize: FONT.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  rowLabel: { fontSize: FONT.sm, flex: 1 },
  rowValue: { fontSize: FONT.sm, fontWeight: '600', textAlign: 'left' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: FONT.md, fontWeight: '600' },
  settingHint: { fontSize: FONT.xs, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.lg, padding: 16, marginTop: 4,
  },
  logoutText: { color: '#fff', fontSize: FONT.lg, fontWeight: '700' },
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.lg, padding: 14, marginTop: 4, borderWidth: 1,
  },
  updateBtnText: { fontSize: FONT.md, fontWeight: '600' },
});
