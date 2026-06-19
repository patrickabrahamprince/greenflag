// @ts-nocheck
import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../lib/store';

export default function ProfileTab() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const coins = useAppStore((state) => state.coins);
  const connections = useAppStore((state) => state.connections);

  const primaryPhoto = user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  return (
    <ScrollView className="flex-1 bg-black px-6 pt-16 pb-24">
      {/* Header with settings gear */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-3xl font-black">My Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center"
        >
          <Ionicons name="settings-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* User Information */}
      <View className="items-center mb-8">
        <View className="w-32 h-32 rounded-full border-4 border-[#1A4D1A] overflow-hidden mb-4 shadow-xl">
          <Image source={{ uri: primaryPhoto }} className="w-full h-full" />
        </View>
        <Text className="text-2xl font-black">{user?.name || 'User'}, {user?.age || 25}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-sharp" size={14} color="#8FAE8F" />
          <Text className="text-zinc-400 text-xs font-semibold ml-1">{user?.city || 'India'}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-4 mb-8">
        
        {/* Wallet Balance Card */}
        <TouchableOpacity
          onPress={() => router.push('/wallet')}
          activeOpacity={0.8}
          className="flex-1 p-5 bg-[#18181B] border border-zinc-800 rounded-3xl items-center shadow-lg"
        >
          <Ionicons name="wallet-outline" size={24} color="#D4AF37" className="mb-2" />
          <Text className="text-xs text-zinc-500 uppercase font-bold mb-1">Coin Balance</Text>
          <Text className="text-xl font-black text-[#D4AF37]">{coins}</Text>
        </TouchableOpacity>

        {/* Connected Count Card */}
        <View className="flex-1 p-5 bg-[#18181B] border border-zinc-800 rounded-3xl items-center shadow-lg">
          <Ionicons name="link-outline" size={24} color="#8FAE8F" className="mb-2" />
          <Text className="text-xs text-zinc-500 uppercase font-bold mb-1">Connections</Text>
          <Text className="text-xl font-black text-white">{connections.length}</Text>
        </View>

      </View>

      {/* Actions */}
      <View className="space-y-4 gap-4 mb-20">
        
        {/* Buy Coins package */}
        <TouchableOpacity
          onPress={() => router.push('/buy-coins')}
          activeOpacity={0.8}
          className="p-5 bg-[#1A4D1A] border border-[#2D5F2D] rounded-3xl flex-row justify-between items-center"
        >
          <View>
            <Text className="text-base font-bold text-white">Purchase Coins</Text>
            <Text className="text-xs text-zinc-300 mt-1">Indian UPI Checkout packs starting from ₹99</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Edit profile */}
        <TouchableOpacity
          onPress={() => router.push('/settings/edit-profile')}
          activeOpacity={0.8}
          className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl flex-row justify-between items-center"
        >
          <View>
            <Text className="text-base font-bold text-white">Edit Profile Details</Text>
            <Text className="text-xs text-zinc-500 mt-1">Update bio, interests, and profile pictures</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
