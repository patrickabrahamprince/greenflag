// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';

export default function GuidelinesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Community Guidelines</Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="mt-2 space-y-4 gap-4">
          <Text className="text-sm font-bold text-white mb-2">1. Be Direct & Genuine</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Greenflag prioritizes standards-first compatibility. Be honest when setting your intention lists. Building frivolous or misleading intentions will lead to profile restrictions.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">2. Respect the Streak Framework</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Daily milestone checks expire in 24 hours. Respect your partner's time. Check-ins should be submitted with earnest compliance. If you cannot check in, consider using a Streak Freeze.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">3. Safe Spaces</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Abuse, harassment, or offensive chat behavior is strictly prohibited. Unlocked chats have a report flag that immediately forwards logs to our moderators.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">4. Zero Tolerance</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Spammers or bots will be locked immediately and IP banned. We preserve the integrity of authentic, high-standard matches.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
