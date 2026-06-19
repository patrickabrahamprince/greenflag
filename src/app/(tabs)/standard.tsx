// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../lib/store';

const MOCK_INTENTIONS = [
  'Consistent WhatsApp response rate within 2 hours',
  'Weekly Friday date nights in local coffee shops',
  'Agreement on equal splits or specific sharing rules',
  'Mutual introduction to best friends within 3 weeks',
  'No contact with ex-partners',
  'Honesty about daily routines and activities',
  'Clear goals about commitment and timelines',
  'Willingness to solve conflicts through open chat'
];

export default function StandardTab() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const coins = useAppStore((state) => state.coins);
  const deductCoins = useAppStore((state) => state.deductCoins);
  
  const isSetStandard = user?.persona === 'standard'; // Women / curator
  const [builderSteps, setBuilderSteps] = useState<string[]>(MOCK_INTENTIONS.slice(0, 5));
  const [loading, setLoading] = useState(false);

  const handleRemoveStep = (idx: number) => {
    setBuilderSteps(builderSteps.filter((_, i) => i !== idx));
  };

  const handleAddCustomStep = () => {
    if (builderSteps.length >= 8) {
      Alert.alert('Limit Reached', 'You can have at most 8 intentions in your standard list.');
      return;
    }
    const custom = `Standard Intention #${builderSteps.length + 1}`;
    setBuilderSteps([...builderSteps, custom]);
  };

  const handleBuyIn = () => {
    if (coins < 100) {
      Alert.alert(
        'Insufficient Coins',
        'You need 100 coins to begin matching standards. Open your wallet to top-up.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Wallet', onPress: () => router.push('/wallet') }
        ]
      );
      return;
    }

    Alert.alert(
      'Begin Match Buy-In',
      'This will deduct 100 coins to initiate the matching process. Are you ready?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Begin Match',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              deductCoins(100);
              setLoading(false);
              router.push('/connection/conn_1');
            }, 1000);
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-black w-full h-full pb-24">
      {isSetStandard ? (
        // Women Intention Builder View
        <ScrollView className="flex-1 px-6 pt-16">
          <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
            Standard Curator
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            Intention Builder
          </Text>
          <Text className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Construct your 8 essential criteria. Candidates rising to your standard must verify compliance daily.
          </Text>

          <View className="space-y-3 gap-3 mb-6">
            {builderSteps.map((step, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between p-4 bg-[#18181B] border border-zinc-800 rounded-2xl"
              >
                <View className="flex-1 flex-row items-center mr-3">
                  <View className="w-6 h-6 rounded-full bg-[#1A4D1A] items-center justify-center mr-3">
                    <Text className="text-xs text-white font-bold">{idx + 1}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-zinc-100 flex-1">{step}</Text>
                </View>
                
                <TouchableOpacity onPress={() => handleRemoveStep(idx)} className="p-1">
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {builderSteps.length < 8 && (
            <TouchableOpacity
              onPress={handleAddCustomStep}
              className="flex-row items-center justify-center py-4 bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl mb-8"
            >
              <Ionicons name="add-circle-outline" size={20} color="#8FAE8F" className="mr-2" />
              <Text className="text-[#8FAE8F] text-sm font-bold ml-1">Add Standard Intention ({builderSteps.length}/8)</Text>
            </TouchableOpacity>
          )}

          <Button
            title="Lock & Publish Standards"
            onPress={() => Alert.alert('Standards Locked', 'Your standard intentions have been live-published.')}
            disabled={builderSteps.length === 0}
          />
        </ScrollView>
      ) : (
        // Men Full-bleed Blurred Card View
        <View className="flex-1 relative">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' }}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            blurRadius={25}
          />
          <View className="absolute inset-0 bg-black/85" />
          
          <View className="flex-1 justify-between px-6 pt-20 pb-12">
            <View className="items-center mt-6">
              <View className="w-16 h-16 bg-[#2D5F2D] rounded-full items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={30} color="#D4AF37" />
              </View>
              <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
                Challenge Mode
              </Text>
              <Text className="text-white text-3xl font-black text-center mb-4">
                Rising to Standard
              </Text>
              <Text className="text-zinc-400 text-sm text-center px-4 leading-relaxed">
                Unlock the Curator's 8-day standard framework. Prove compliance, maintain daily streaks, and connect.
              </Text>
            </View>

            {/* Price Buy-in Indicator */}
            <View className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 items-center shadow-2xl mb-8">
              <Text className="text-xs text-zinc-500 uppercase font-semibold mb-1">Standard Entry Buy-in</Text>
              <View className="flex-row items-baseline mb-2">
                <Ionicons name="sparkles" size={20} color="#D4AF37" className="mr-1" />
                <Text className="text-4xl font-black text-white ml-1">100</Text>
                <Text className="text-base font-bold text-zinc-400 ml-1"> Coins</Text>
              </View>
              <Text className="text-[11px] text-zinc-500 text-center">
                Your current balance: {coins} coins
              </Text>
            </View>

            {/* CTAs */}
            <View className="space-y-3 gap-3">
              <Button
                title="Begin Challenge (100 Coins)"
                variant="gold"
                loading={loading}
                onPress={handleBuyIn}
              />
              
              <TouchableOpacity
                onPress={() => router.push('/standard/partner_1')}
                className="py-3 items-center"
              >
                <Text className="text-xs text-zinc-500 font-bold tracking-wider">
                  PREVIEW STANDARDS FIRST
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
