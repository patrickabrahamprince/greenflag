// @ts-nocheck
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 34,
          backgroundColor: '#18181B', // Dark Card BG: zinc-900
          borderTopWidth: 2,
          borderColor: '#27272A', // Border color: zinc-800
          paddingBottom: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: '#22C55E', // Active color: Green
        tabBarInactiveTintColor: '#A1A1AA', // Inactive color: zinc-400
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="standard"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              size={26}
              color={focused ? '#8FAE8F' : '#A1A1AA'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={26}
              color={focused ? '#8FAE8F' : '#A1A1AA'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={26}
              color={focused ? '#8FAE8F' : '#A1A1AA'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className={`w-8 h-8 rounded-full overflow-hidden border-2 ${focused ? 'border-[#8FAE8F]' : 'border-transparent'}`}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                className="w-full h-full"
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

