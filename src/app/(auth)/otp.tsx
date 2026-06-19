// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../lib/store';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert('Verification Code', 'Please enter a 6-digit verification code.');
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone || '+919999999999',
        token: otp,
        type: 'sms',
      });

      if (error) {
        console.log('OTP Verification Error:', error.message);
        // Fallback for debug: let them proceed on test credentials
        if (otp === '123456' || otp === '000000') {
          // let them pass
        } else {
          Alert.alert('Error', error.message || 'OTP verification failed. Hint: Use 123456 for testing.');
          setLoading(false);
          return;
        }
      }
      
      // Let store user update
      setUser({ id: data?.user?.id || 'mock_user_id', phone });
      
      // Next flow in onboarding is persona choice
      router.push('/(auth)/persona');
    } catch (e) {
      console.log('Verification exception:', e);
      router.push('/(auth)/persona');
    } finally {
      setLoading(false);
    }
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
            Security Check
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            Enter Verification Code
          </Text>
          <Text className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Sent to {phone || 'your phone number'}. Enter the 6-digit code.
          </Text>

          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="0 0 0 0 0 0"
            placeholderTextColor="#52525B"
            keyboardType="number-pad"
            maxLength={6}
            className="w-full h-16 bg-[#18181B] border border-zinc-800 rounded-2xl text-center text-white text-2xl font-black tracking-widest mb-6"
          />

          <Text className="text-xs text-zinc-500 text-center italic">
            Hint: Enter "123456" to bypass in development.
          </Text>
        </View>

        {/* Submit */}
        <Button
          title="Verify OTP"
          loading={loading}
          disabled={otp.length < 6}
          onPress={handleVerify}
        />
      </View>
    </SafeAreaView>
  );
}
