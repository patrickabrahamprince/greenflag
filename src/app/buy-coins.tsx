// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../lib/store';
import { COIN_PACKS, CoinPack } from '../lib/utils/coins';

export default function BuyCoinsScreen() {
  const router = useRouter();
  const addCoins = useAppStore((state) => state.addCoins);
  const [selectedPack, setSelectedPack] = useState<CoinPack | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    if (!selectedPack) return;
    setLoading(true);

    // Simulate Razorpay UPI checkout flow
    setTimeout(() => {
      setLoading(false);
      addCoins(selectedPack.coins);
      Alert.alert(
        'Payment Successful',
        `₹${selectedPack.priceINR} payment verified via UPI. ${selectedPack.coins} coins added to your wallet!`,
        [{ text: 'Great', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-6 pb-10">
        
        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between pb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-base font-black">Coin Store</Text>
            <View className="w-10" />
          </View>

          <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
            Indian UPI Checkout
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            Purchase Coins
          </Text>
          
          <Text className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Choose a coin pack to unlock standard matches and buy streak freezes. Payment is processed securely via UPI.
          </Text>

          {/* Pricing Grid */}
          <View className="space-y-4 gap-4 mb-8">
            {COIN_PACKS.map((pack) => {
              const isSelected = selectedPack?.id === pack.id;
              return (
                <TouchableOpacity
                  key={pack.id}
                  onPress={() => setSelectedPack(pack)}
                  activeOpacity={0.8}
                  className={`p-5 rounded-3xl border flex-row justify-between items-center ${
                    isSelected
                      ? 'bg-[#1A4D1A] border-[#8FAE8F]'
                      : 'bg-[#18181B] border-zinc-800'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={20} color="#D4AF37" className="mr-3" />
                    <View>
                      <Text className="text-base font-bold">{pack.coins} Coins</Text>
                      <Text className="text-[10px] text-zinc-400 mt-1 font-semibold">{pack.label}</Text>
                    </View>
                  </View>
                  
                  <Text className="text-lg font-black text-[#D4AF37]">₹{pack.priceINR}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Checkout action */}
        <Button
          title={selectedPack ? `Pay ₹${selectedPack.priceINR} via UPI` : 'Select a Package'}
          loading={loading}
          disabled={!selectedPack}
          variant="gold"
          onPress={handleCheckout}
        />

      </View>
    </SafeAreaView>
  );
}
