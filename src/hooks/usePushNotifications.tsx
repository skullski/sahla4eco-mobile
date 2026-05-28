import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '../contexts/AuthContext';
import { registerPushToken, unregisterPushToken, fetchNotifications, markNotificationsRead } from '../api/auth';
import { getJwt } from '../api/client';
import type { EventSubscription } from 'expo-modules-core';
import type { AppNotification } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotifContextType {
  notifications: AppNotification[];
  unreadCount: number;
  register: () => Promise<void>;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotifContext = createContext<NotifContextType | null>(null);

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (!Device.isDevice) return;

    // Create Android notification channel for sound to work on Android 8+
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'الإشعارات',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    setExpoPushToken(tokenData.data);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const jwt = await getJwt();
      if (!jwt) return;
      const data = await fetchNotifications(jwt);
      setNotifications(data);
    } catch {}
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      const jwt = await getJwt();
      if (!jwt) return;
      await markNotificationsRead(jwt);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }, [user]);

  // Auto-register push on cold start when already logged in
  useEffect(() => {
    if (user && !expoPushToken) {
      register().catch(() => {});
    }
  }, [user]);

  // Send push token to server when both user and token are ready
  useEffect(() => {
    if (user && expoPushToken) {
      (async () => {
        const jwt = await getJwt();
        if (!jwt) return;
        registerPushToken(jwt, expoPushToken, Platform.OS).catch(() => {});
      })();
    }
  }, [user, expoPushToken]);

  // Listen for incoming notifications
  useEffect(() => {
    const notifSub = Notifications.addNotificationReceivedListener((n) => {
      const data = n.request.content.data as any;
      if (data?.type) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: data.type,
            title: n.request.content.title || '',
            body: n.request.content.body || '',
            order_id: data.order_id,
            read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    const respSub = Notifications.addNotificationResponseReceivedListener((r) => {
      // Navigation handled by the app navigator
    });

    return () => {
      notifSub.remove();
      respSub.remove();
    };
  }, []);

  // Refresh notifications periodically
  useEffect(() => {
    if (!user) return;
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, register, refresh, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif must be inside NotifProvider');
  return ctx;
}
