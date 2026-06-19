// @ts-nocheck
import React from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Text';
import { Button } from '../../../components/ui/Button';

export default function ConnectionEndedScreen() {
  const router = useRouter();
  const { id, reason } = useLocalSearchParams();

  let headline = 'Connection Ended';
  let desc = 'This compatibility challenge is closed.';
  let icon = 'heart-dislike';
  let color = '#FF6B6B';

  if (reason === 'expired') {
    headline = 'Streak Expired';
    desc = 'The 24-hour daily milestone check-in timer ran out. Don\'t lose momentum next time!';
    icon = 'time';
    color = '#FF8C00';
  } else if (reason === 'rejected') {
    headline = 'Standards Rejected';
    desc = 'A daily compatibility check-in was rejected by the curator. Better alignment awaits!';
    icon = 'close-circle';
    color = '#FF6B6B';
  } else if (reason === 'quit') {
    headline = 'Challenge Quitted';
    desc = 'You manually stepped away from this compatibility streak.';
    icon = 'exit';
    color = '#A1A1AA';
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-20 pb-10">
        
        {/* Top Spacer */}
        <View />

        {/* Content */}
        <View className="items-center px-4 my-auto">
          <View className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center mb-6">
            <Ionicons name={icon} size={38} color={color} />
          </View>
          
          <Text className="text-white text-3xl font-black text-center mb-4">{headline}</Text>
          <Text className="text-zinc-400 text-sm text-center leading-relaxed mb-8">
            {desc}
          </Text>
        </View>

        {/* CTA */}
        <Button
          title="Return to Standard"
          onPress={() => router.replace('/(tabs)/standard')}
        />

      </View>
    </SafeAreaView>
  );
}
