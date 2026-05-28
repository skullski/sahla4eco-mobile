import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotif } from '../hooks/usePushNotifications';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT, SHADOW } from '../constants/theme';

export function LoginScreen({ onSwitchToQR }: { onSwitchToQR?: () => void }) {
  const { login } = useAuth();
  const { register } = useNotif();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      register().catch(() => {});
    } catch (e: any) {
      Alert.alert('خطأ في تسجيل الدخول', e.message || 'تأكد من البريد الإلكتروني وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🛒</Text>
          <Text style={[styles.title, { color: colors.text }]}>Sahla4Eco</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>تطبيق المتجر</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>البريد الإلكتروني</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>كلمة المرور</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>

          {onSwitchToQR && (
            <>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity style={[styles.qrButton, { borderColor: colors.primary }]} onPress={onSwitchToQR}>
                <Text style={styles.qrIcon}>📷</Text>
                <Text style={[styles.qrButtonText, { color: colors.primary }]}>مسح رمز QR</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: FONT.xxl, fontWeight: '800' },
  subtitle: { fontSize: FONT.sm, marginTop: 4 },
  form: { gap: 4 },
  label: { fontSize: FONT.sm, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  input: { borderRadius: RADIUS.md, padding: 14, fontSize: FONT.md, borderWidth: 1 },
  button: { borderRadius: RADIUS.md, padding: 16, alignItems: 'center', marginTop: 20, ...SHADOW.button },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FONT.lg, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: FONT.sm },
  qrButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 2, borderStyle: 'dashed',
  },
  qrIcon: { fontSize: 18 },
  qrButtonText: { fontSize: FONT.md, fontWeight: '700' },
});
