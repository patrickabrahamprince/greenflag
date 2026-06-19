// @ts-nocheck
import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useAppStore } from '../../lib/store';

export default function ChatTab() {
  const router = useRouter();
  const connections = useAppStore((state) => state.connections);
  const chatLocks = useAppStore((state) => state.chatLocks);

  // Chat is unlocked if connection day >= 5
  const unlockedConnections = connections.filter((conn) => {
    const day = chatLocks[conn.id] || conn.currentDay;
    return day >= 5;
  });

  const lockedConnections = connections.filter((conn) => {
    const day = chatLocks[conn.id] || conn.currentDay;
    return day < 5;
  });

  return (
    <ScrollView className="flex-1 bg-black px-6 pt-16 pb-24">
      <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
        Direct Messages
      </Text>
      <Text className="text-white text-3xl font-black mb-6">
        Conversations
      </Text>

      {unlockedConnections.length === 0 && lockedConnections.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="chatbubbles-outline" size={48} color="#52525B" className="mb-4" />
          <Text className="text-zinc-500 text-center font-bold">No Chats Available</Text>
          <Text className="text-zinc-600 text-xs text-center mt-2 px-6">
            Make progress on standard connections to unlock chat privileges.
          </Text>
        </View>
      ) : (
        <View className="space-y-4 gap-4 pb-20">
          
          {/* Unlocked Chats */}
          {unlockedConnections.map((conn) => (
            <TouchableOpacity
              key={conn.id}
              onPress={() => router.push(`/chat/${conn.id}`)}
              activeOpacity={0.8}
              className="flex-row items-center p-4 bg-[#18181B] border border-zinc-800 rounded-2xl"
            >
              <Image source={{ uri: conn.partner.avatar }} className="w-12 h-12 rounded-full mr-4" />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base font-bold">{conn.partner.name}</Text>
                  <Text className="text-xs text-zinc-500 font-semibold">Active</Text>
                </View>
                <Text className="text-sm text-zinc-400 font-medium" numberOfLines={1}>
                  Tap to chat... Conversation unlocked at Day {conn.currentDay}/8
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A1A1AA" className="ml-2" />
            </TouchableOpacity>
          ))}

          {/* Locked Chats */}
          {lockedConnections.map((conn) => (
            <View
              key={conn.id}
              className="flex-row items-center p-4 bg-[#18181B]/40 border border-zinc-900 rounded-2xl opacity-60"
            >
              <Image source={{ uri: conn.partner.avatar }} className="w-12 h-12 rounded-full mr-4 grayscale" />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base font-bold text-zinc-500">{conn.partner.name}</Text>
                  <View className="flex-row items-center bg-zinc-850 px-2 py-0.5 rounded">
                    <Ionicons name="lock-closed" size={10} color="#D4AF37" className="mr-1" />
                    <Text className="text-[10px] text-[#D4AF37] font-bold ml-1">LOCKED</Text>
                  </View>
                </View>
                <Text className="text-xs text-zinc-600 font-bold">
                  Earn chat at 5/8 (Currently at Day {conn.currentDay})
                </Text>
              </View>
            </View>
          ))}

          {unlockedConnections.length === 0 && lockedConnections.length > 0 && (
            <View className="items-center py-6 mt-4">
              <Text className="text-sm text-[#D4AF37] font-bold uppercase tracking-wider text-center">
                🔒 Earn chat at 5/8
              </Text>
              <Text className="text-xs text-zinc-500 text-center mt-1">
                Reach Day 5 in your connection milestone checkins to message partners.
              </Text>
            </View>
          )}

        </View>
      )}
    </ScrollView>
  );
}
