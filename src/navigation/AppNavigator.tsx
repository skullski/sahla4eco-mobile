import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useColors } from '../contexts/ThemeContext';
import { FONT } from '../constants/theme';

const Tab = createBottomTabNavigator();
const OrdersStack = createNativeStackNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>{icon}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22, opacity: 0.5 },
  iconActive: { opacity: 1 },
});

function OrdersStackScreen() {
  const colors = useColors();
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: 'تفاصيل الطلب',
          headerShown: true,
          headerBackTitle: 'رجوع',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      />
    </OrdersStack.Navigator>
  );
}

export function AppNavigator() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{
          tabBarLabel: 'الطلبات',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
