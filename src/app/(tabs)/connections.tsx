// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { useAppStore } from '../../lib/store';
import { calculateTimeRemaining } from '../../lib/utils/timer';

export default function ConnectionsTab() {
  const router = useRouter();
  const connections = useAppStore((state) => state.connections);
  const [timers, setTimers] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimers = () => {
      const updated: Record<string, string> = {};
      connections.forEach((conn) => {
        const remaining = calculateTimeRemaining(conn.expiresAt);
        updated[conn.id] = `${remaining.hours}:${remaining.minutes}:${remaining.seconds}`;
      });
      setTimers(updated);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [connections]);

  return (
    <ScrollView className="flex-1 bg-black px-6 pt-16 pb-24">
      <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
        Active Matches
      </Text>
      <Text className="text-white text-3xl font-black mb-6">
        Connections
      </Text>

      {connections.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="people-outline" size={48} color="#52525B" className="mb-4" />
          <Text className="text-zinc-500 text-center font-bold">No active connections</Text>
          <Text className="text-zinc-600 text-xs text-center mt-2 px-6">
            Initiate a standard match challenge to start day-by-day compatibility streaks.
          </Text>
        </View>
      ) : (
        <View className="space-y-4 gap-4 pb-20">
          {connections.map((conn) => (
            <TouchableOpacity
              key={conn.id}
              onPress={() => router.push(`/connection/${conn.id}`)}
              activeOpacity={0.9}
              className="p-5 bg-[#18181B] border border-zinc-800 rounded-3xl"
            >
              {/* Partner info */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: conn.partner.avatar }}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <View>
                    <Text className="text-base font-bold">{conn.partner.name}, {conn.partner.age}</Text>
                    <Text className="text-xs text-zinc-500 font-semibold">{conn.partner.city}</Text>
                  </View>
                </View>
                
                <View className="bg-[#2D5F2D] px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-white">Day {conn.currentDay}/8</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-xs text-zinc-500 font-semibold">Streak Progress</Text>
                  <Text className="text-xs text-[#D4AF37] font-bold">{conn.progress}%</Text>
                </View>
                <View className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#D4AF37]"
                    style={{ width: `${conn.progress}%` }}
                  />
                </View>
              </View>

              {/* Timer & Details */}
              <View className="flex-row justify-between items-center border-t border-zinc-800/80 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#FF6B6B" />
                  <Text className="text-xs text-red-400 font-bold ml-1">
                    Expires in {timers[conn.id] || '--:--:--'}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-xs text-[#8FAE8F] font-bold mr-1">Status</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8FAE8F" />
                </View>
              </View>

            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
