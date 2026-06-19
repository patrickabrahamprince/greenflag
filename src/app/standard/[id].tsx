// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

const MOCK_STANDARDS = [
  'Consistent WhatsApp response rate within 2 hours',
  'Weekly Friday date nights in local coffee shops',
  'Agreement on equal splits or specific sharing rules',
  'Mutual introduction to best friends within 3 weeks',
  'No contact with ex-partners',
  'Honesty about daily routines and activities',
  'Clear goals about commitment and timelines',
  'Willingness to solve conflicts through open chat'
];

export default function StandardPreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Curator Standards</Text>
          <View className="w-10" />
        </View>

        <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
          Intention Guidelines
        </Text>
        <Text className="text-white text-3xl font-black mb-6">
          Preview Framework
        </Text>

        <Text className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Before committing 100 coins, review the standards set by the curator. You must check-in and confirm compliance for each day to maintain the match.
        </Text>

        {/* List of Standards */}
        <View className="space-y-4 gap-4 mb-8">
          {MOCK_STANDARDS.map((std, idx) => (
            <View
              key={idx}
              className="p-4 bg-[#18181B] border border-zinc-800 rounded-2xl flex-row items-start"
            >
              <View className="w-6 h-6 rounded-full bg-[#1A4D1A] items-center justify-center mr-3 mt-0.5">
                <Text className="text-xs text-white font-bold">{idx + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-zinc-500 font-bold uppercase mb-1">Day {idx + 1} Intention</Text>
                <Text className="text-sm text-zinc-200 font-semibold">{std}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <Button
          title="Return to Standard"
          onPress={() => router.back()}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
