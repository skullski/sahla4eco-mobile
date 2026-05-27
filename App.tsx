import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NotifProvider } from './src/hooks/usePushNotifications';
import { LoginScreen } from './src/screens/LoginScreen';
import { QRLoginScreen } from './src/screens/QRLoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS, FONT } from './src/constants/theme';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'email' | 'qr'>('email');

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🛒</Text>
        <Text style={styles.splashTitle}>Sahla4Eco</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
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
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotifProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </NotifProvider>
      </AuthProvider>
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
