import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import * as Updates from 'expo-updates';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NotifProvider } from './src/hooks/usePushNotifications';
import { ThemeContext, LIGHT_COLORS, DARK_COLORS } from './src/contexts/ThemeContext';
import type { ThemePreference } from './src/contexts/ThemeContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { QRLoginScreen } from './src/screens/QRLoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FONT } from './src/constants/theme';

const THEME_KEY = 'sahla_theme_pref';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'email' | 'qr'>('email');

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🛒</Text>
        <Text style={styles.splashTitle}>Sahla4Eco</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {authScreen === 'email' ? (
          <LoginScreen onSwitchToQR={() => setAuthScreen('qr')} />
        ) : (
          <QRLoginScreen onSwitchToEmail={() => setAuthScreen('email')} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <AppNavigator />
    </SafeAreaView>
  );
}

export default function App() {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') {
        setPreference(v);
      }
      setLoaded(true);
    });
  }, []);

  const setPref = (p: ThemePreference) => {
    setPreference(p);
    SecureStore.setItemAsync(THEME_KEY, p);
  };

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // OTA update failed - will try again next launch
      }
    })();
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={{ isDark, colors, preference, setPreference: setPref }}>
        <AuthProvider>
          <NotifProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </NavigationContainer>
          </NotifProvider>
        </AuthProvider>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  splashLogo: { fontSize: 64, marginBottom: 12 },
  splashTitle: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    color: '#fff',
  },
});
