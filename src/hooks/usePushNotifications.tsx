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
    console.log('[push] register() called, isDevice:', Device.isDevice);
    if (!Device.isDevice) {
      console.log('[push] SKIPPED: not a physical device');
      return;
    }

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
    console.log('[push] existing permission:', existingStatus);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[push] requested permission result:', finalStatus);
    }
    if (finalStatus !== 'granted') {
      console.log('[push] SKIPPED: permission not granted');
      return;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('[push] got token:', tokenData.data);
      setExpoPushToken(tokenData.data);
    } catch (e: any) {
      console.error('[push] getExpoPushTokenAsync FAILED:', e.message);
    }
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
      console.log('[push] cold start: user exists but no token, calling register()');
      register().catch((e: any) => {
        console.error('[push] cold start register() FAILED:', e.message);
      });
    }
  }, [user]);

  // Send push token to server when both user and token are ready
  useEffect(() => {
    if (user && expoPushToken) {
      (async () => {
        console.log('[push] sending token to server, user:', user.id, 'token:', expoPushToken);
        const jwt = await getJwt();
        if (!jwt) {
          console.log('[push] SKIPPED: no JWT available');
          return;
        }
        try {
          await registerPushToken(jwt, expoPushToken, Platform.OS);
          console.log('[push] token registered successfully');
        } catch (e: any) {
          console.error('[push] registerPushToken FAILED:', e.message);
        }
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
