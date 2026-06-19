// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../lib/store';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid mobile number.');
      return;
    }
    setLoading(true);

    const fullPhoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;

    Alert.alert('Phone Login Disabled', 'Phone OTP login has been removed permanently. Please use the web interface to login with email/password.');
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-12 pb-10">
        
        {/* Back Button */}
        <View className="flex-row">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Form area */}
        <View className="my-auto px-2">
          <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
            India-First Verification
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            Enter Phone Number
          </Text>
          <Text className="text-zinc-400 text-sm mb-8 leading-relaxed">
            We will send a 6-digit secure code to verify your mobile number.
          </Text>

          <View className="flex-row items-center w-full h-16 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 mb-4">
            <Text className="text-white text-lg font-bold mr-3">+91</Text>
            <View className="w-[1] h-6 bg-zinc-800 mr-4" />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="99999 99999"
              placeholderTextColor="#52525B"
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 h-full text-white text-lg font-semibold"
            />
          </View>
        </View>

        {/* Submit */}
        <Button
          title="Send OTP"
          loading={loading}
          disabled={phone.length < 10}
          onPress={handleSendOTP}
        />
      </View>
    </SafeAreaView>
  );
}
