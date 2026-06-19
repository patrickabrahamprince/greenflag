// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, Switch, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../lib/store';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Greenflag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Settings</Text>
          <View className="w-10" />
        </View>

        {/* Notifications Toggle */}
        <View className="p-5 bg-[#18181B] border border-zinc-800 rounded-3xl flex-row justify-between items-center mb-6 mt-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold">Push Notifications</Text>
            <Text className="text-xs text-zinc-500 mt-1">Get notified for daily milestone deadlines and streak warnings.</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#27272A', true: '#1A4D1A' }}
            thumbColor={notifications ? '#8FAE8F' : '#52525B'}
          />
        </View>

        {/* Legal documents list */}
        <Text className="text-sm font-bold text-zinc-400 mb-3 px-1 uppercase tracking-wider">Legal & Compliance</Text>
        <View className="bg-[#18181B] border border-zinc-800 rounded-3xl overflow-hidden mb-8">
          
          <TouchableOpacity
            onPress={() => router.push('/legal/terms')}
            className="p-5 flex-row justify-between items-center border-b border-zinc-800"
          >
            <Text className="text-sm font-semibold">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/legal/privacy')}
            className="p-5 flex-row justify-between items-center border-b border-zinc-800"
          >
            <Text className="text-sm font-semibold">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/legal/guidelines')}
            className="p-5 flex-row justify-between items-center"
          >
            <Text className="text-sm font-semibold">Community Guidelines</Text>
            <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
          </TouchableOpacity>

        </View>

        {/* Logout */}
        <Button
          title="Log Out Session"
          variant="danger"
          onPress={handleLogout}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
