/**
 * AGENT INSTRUCTIONS — LOGIN SCREEN
 * ----------------------------------------------------------------------------
 * Three sign-in paths, all equally valid:
 *   1. Email + password (existing users)
 *   2. Scan QR code from the web platform (existing users)
 *   3. Sign in with Google / Gmail (auto-registers a new client account
 *      if the Gmail address is not yet on the platform)
 *
 * Do not add social providers beyond Google. Do not add a phone-number
 * sign-in here (the web platform handles that).
 * ----------------------------------------------------------------------------
 */
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotif } from '../hooks/usePushNotifications';
import { useColors } from '../contexts/ThemeContext';
import { RADIUS, FONT } from '../constants/theme';
import { GOOGLE_WEB_CLIENT_ID } from '../constants/api';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen({ onSwitchToQR }: { onSwitchToQR?: () => void }) {
  const { login, loginGoogle } = useAuth();
  const { register } = useNotif();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth via expo-auth-session. Uses a web-based redirect so it
  // works on every Android system (microG, /e/OS, no Google Play, etc).
  const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = (googleResponse as any).params?.id_token;
      if (!idToken) {
        Alert.alert('خطأ', 'لم نستلم رمز التحقق من Google');
        setGoogleLoading(false);
        return;
      }
      (async () => {
        try {
          await loginGoogle(idToken);
          register().catch(() => {});
        } catch (e: any) {
          Alert.alert('خطأ', e.message || 'فشل تسجيل الدخول عبر Google');
        } finally {
          setGoogleLoading(false);
        }
      })();
    } else if (googleResponse?.type === 'error') {
      Alert.alert('خطأ', 'فشل تسجيل الدخول عبر Google');
      setGoogleLoading(false);
    } else if (googleResponse?.type === 'dismiss' || googleResponse?.type === 'cancel') {
      setGoogleLoading(false);
    }
  }, [googleResponse]);

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
      Alert.alert('خطأ', e.message || 'تأكد من البريد الإلكتروني وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (GOOGLE_WEB_CLIENT_ID.includes('PLACEHOLDER')) {
      Alert.alert('غير مُهيّأ', 'تسجيل الدخول عبر Google لم يُضبط بعد على هذا البناء');
      return;
    }
    setGoogleLoading(true);
    try {
      await googlePromptAsync();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر فتح شاشة Google');
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <Ionicons name="storefront" size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Sahla4Eco</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>لوحة تحكم المتجر</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text, flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="كلمة المرور"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonInner}>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>أو</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#1f2937" />
            ) : (
              <View style={styles.buttonInner}>
                <GoogleMark />
                <Text style={styles.googleButtonText}>تسجيل الدخول عبر Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {onSwitchToQR && (
            <TouchableOpacity style={[styles.qrButton, { borderColor: colors.border }]} onPress={onSwitchToQR}>
              <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
              <Text style={[styles.qrButtonText, { color: colors.primary }]}>مسح رمز QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Inline Google "G" mark so we don't need an extra asset.
function GoogleMark() {
  return (
    <View style={styles.gMark}>
      <Text style={styles.gMarkText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 36 },
  logoWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: FONT.xl, fontWeight: '800' },
  subtitle: { fontSize: FONT.sm, marginTop: 4 },
  form: { gap: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: RADIUS.md, paddingHorizontal: 12, borderWidth: 1, height: 48 },
  input: { paddingVertical: 0, fontSize: FONT.md },
  button: { borderRadius: RADIUS.md, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  buttonText: { color: '#fff', fontSize: FONT.md, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: FONT.sm },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0',
    borderRadius: RADIUS.md, padding: 13, gap: 8,
  },
  googleButtonText: { color: '#1f2937', fontSize: FONT.md, fontWeight: '600' },
  gMark: {
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0',
  },
  gMarkText: { fontSize: 12, fontWeight: '800', color: '#4285F4' },
  qrButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 12, borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'dashed',
  },
  qrButtonText: { fontSize: FONT.md, fontWeight: '700' },
});
