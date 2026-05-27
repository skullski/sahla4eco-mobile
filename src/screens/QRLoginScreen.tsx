import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../contexts/AuthContext';
import { useNotif } from '../hooks/usePushNotifications';
import { COLORS, RADIUS, FONT } from '../constants/theme';

interface Props {
  onSwitchToEmail: () => void;
}

export function QRLoginScreen({ onSwitchToEmail }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const { loginQR } = useAuth();
  const { register } = useNotif();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleScan = async (data: string) => {
    if (!scanning) return;
    setScanning(false);
    try {
      await loginQR(data);
      register();
    } catch (e: any) {
      Alert.alert('فشل تسجيل الدخول', e.message || 'الرمز غير صالح أو منتهي الصلاحية');
      setScanning(true);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>صلاحية الكاميرا مطلوبة</Text>
        <Text style={styles.subtitle}>نحتاج إلى صلاحية الكاميرا لمسح رمز QR</Text>
        <Text style={styles.link} onPress={requestPermission}>منح الصلاحية</Text>
        <Text style={[styles.link, { marginTop: 20 }]} onPress={onSwitchToEmail}>
          تسجيل الدخول بالبريد الإلكتروني
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanning ? (r) => handleScan(r.data) : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.hint}>ضع رمز QR داخل الإطار</Text>
          <Text style={styles.switchLink} onPress={onSwitchToEmail}>
            تسجيل الدخول بالبريد الإلكتروني
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  link: {
    fontSize: FONT.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  hint: {
    color: '#fff',
    fontSize: FONT.sm,
    marginTop: 24,
    opacity: 0.8,
  },
  switchLink: {
    color: COLORS.primary,
    fontSize: FONT.sm,
    fontWeight: '600',
    marginTop: 20,
  },
});
