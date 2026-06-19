// @ts-nocheck
import React, { useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

export default function ConnectedScreen() {
  const router = useRouter();

  useEffect(() => {
    // Trigger mild haptic feedback or visual logs on success mount
    console.log('Success Connected: Haptic Confetti Triggered');
  }, []);

  const handleShareContact = () => {
    Alert.alert('Share Contact Details', 'Your validated mobile number and Instagram handle have been shared with your partner.');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-20 pb-10">
        
        {/* Top Spacer */}
        <View />

        {/* Center Success Info */}
        <View className="items-center px-4 my-auto">
          {/* Glowing Ring */}
          <View className="w-24 h-24 bg-[#D4AF37]/20 border-2 border-[#D4AF37] rounded-full items-center justify-center mb-8 relative shadow-2xl shadow-[#D4AF37]/50">
            <Ionicons name="ribbon-sharp" size={48} color="#D4AF37" />
            
            {/* Small star decor */}
            <View className="absolute -top-1 -right-1 bg-black p-0.5 rounded-full">
              <Ionicons name="sparkles" size={14} color="#D4AF37" />
            </View>
          </View>

          <Text className="text-[#D4AF37] uppercase tracking-widest text-xs font-black mb-3">
            Milestone Accomplished
          </Text>
          <Text className="text-white text-4xl font-black text-center mb-4 leading-tight">
            8/8 Standards Complete
          </Text>
          <Text className="text-zinc-400 text-sm text-center leading-relaxed px-4">
            Congratulations! You have verified compliance for all 8 days. Compatibility is officially proven.
          </Text>
        </View>

        {/* Actions */}
        <View className="space-y-4 gap-4">
          <Button
            title="Share Contact Details"
            variant="gold"
            onPress={handleShareContact}
          />

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/connections')}
            className="h-14 bg-zinc-950 border border-zinc-800 rounded-2xl items-center justify-center"
          >
            <Text className="text-zinc-300 font-bold text-sm">Return to Connections</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
