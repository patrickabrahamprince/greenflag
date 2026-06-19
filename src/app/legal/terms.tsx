// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Terms of Service</Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="mt-2 space-y-4 gap-4">
          <Text className="text-sm font-bold text-white mb-2">1. Agreement to Terms</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Welcome to Greenflag. By using our application, you agree to comply with our core dating standard policies and agreements. Standard builders must set genuine standards, and candidate partners must respect streaks and checkin guidelines.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">2. Token Purchases & Coin Economy</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            All coin economy buy-ins, wallets ledger checks, and streak freezes are executed with digital tokens. UPI transaction topups via Razorpay packages are verified against standard merchant gateways. Refund requests for expired streaks are not entertained.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">3. Moderation & Safety</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            Any user found creating harmful, misleading, or abusive standards will be pushed to the mod_queue and banned. We operate on a strict mutual consent model. No read receipts are provided inside the conversation chats.
          </Text>

          <Text className="text-sm font-bold text-white mb-2">4. Disclaimers</Text>
          <Text className="text-xs text-zinc-400 leading-relaxed">
            We provide Greenflag on an "as-is" basis. Live countdown timers and streak freezing mechanics depend on reliable internet access and system syncs.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
