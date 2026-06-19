// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Privacy Policy</Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="mt-2 space-y-4 gap-4">
          <Text className="text-sm font-bold text-white mb-2">1. Data We Collect</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            We store registration credentials (phone number, bio, city, age, and profile photos) inside encrypted tables on Supabase database layers. Transaction histories are logged to track purchases of coin buy-ins.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">2. Usage of Profile Information</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Photos uploaded during onboarding are utilized solely to compile your matching card layout. Curators review candidate details before approving daily intentions.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">3. Chat Confidentiality</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Conversations unlocked at Day 5/8 are kept completely secure and private. Read receipts are disabled globally. Contact details are only shared upon explicit 8/8 milestone completion.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">4. Third Parties</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Payment transactions are routed securely via standard UPI gateways. No private authentication or phone numbers are shared with commercial entities.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
