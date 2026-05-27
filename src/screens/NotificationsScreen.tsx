import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNotif } from '../hooks/usePushNotifications';
import { COLORS, RADIUS, FONT, SPACING } from '../constants/theme';
import { formatTimeAgo, getNotificationIcon } from '../utils/format';

export function NotificationsScreen({ navigation }: any) {
  const { notifications, unreadCount, refresh, markAllRead } = useNotif();

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Text style={styles.markAllText}>تعيين الكل كمقروء ({unreadCount})</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, !item.read && styles.unread]}
            onPress={() => {
              if (item.order_id) {
                navigation.navigate('OrdersTab', {
                  screen: 'OrderDetail',
                  params: { id: item.order_id },
                });
              }
            }}
          >
            <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
            <View style={styles.content}>
              <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>لا توجد إشعارات</Text>
            <Text style={styles.emptyHint}>عند وصول طلب جديد أو تنبيه، ستظهر هنا</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  markAllBtn: { padding: 12, alignItems: 'center' },
  markAllText: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    gap: 12,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  icon: { fontSize: 24 },
  content: { flex: 1 },
  title: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.text },
  titleUnread: { fontWeight: '800' },
  body: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  time: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textSecondary },
  emptyHint: { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
});
