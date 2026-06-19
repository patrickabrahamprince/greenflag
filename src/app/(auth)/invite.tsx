// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';

export default function InviteScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const setInviteCode = useStore((state) => state.setInviteCode);
  const setUser = useStore((state) => state.setUser);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      // Supabase verification of invite_codes table
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('used', false)
        .single();

      if (error || !data) {
        Alert.alert('Invalid Code', 'The code you entered is invalid or has already been used.');
        // Fallback for demo/testing purposes: let them enter anyway if it's "TEST12" or similar
        if (code.toUpperCase() === 'GREENFLAG') {
          setInviteCode('GREENFLAG');
          router.push('/(auth)/login');
        }
      } else {
        setInviteCode(data.code);
        router.push('/(auth)/login');
      }
    } catch (e) {
      console.log('Error checking invite code:', e);
      // fallback
      if (code.toUpperCase() === 'GREENFLAG') {
        setInviteCode('GREENFLAG');
        router.push('/(auth)/login');
      } else {
        Alert.alert('Verification Failed', 'Unable to verify code. Try "GREENFLAG" for testing.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-12 pb-10">
        
        {/* Back Button */}
        <View className="flex-row">
          <TouchableOpacity onPress={() => router.replace('/')} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Headline */}
        <View className="my-auto px-2">
          <Text className="text-zinc-500 uppercase tracking-widest text-xs font-semibold mb-2">
            Greenflag Membership
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            Enter Invite Code
          </Text>
          <Text className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Greenflag is currently invite-only. Enter your exclusive code to gain access.
          </Text>

          <TextInput
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="E.g., GF-1234-ABCD"
            placeholderTextColor="#52525B"
            autoCapitalize="characters"
            maxLength={16}
            className="w-full h-16 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-lg tracking-widest text-center mb-4"
          />
          
          <Text className="text-xs text-zinc-500 text-center italic">
            Don't have a code? Use "GREENFLAG" to test.
          </Text>
        </View>

        {/* Actions Container */}
        <View className="w-full">
          <Button
            title="Validate Code"
            loading={loading}
            disabled={!code}
            onPress={handleValidate}
          />
          
          {/* REMOVE BEFORE APP STORE SUBMIT */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={() => {
                setUser({
                  id: 'dev-user-123',
                  phone: '+919999999999',
                  persona: 'man',
                  name: 'Dev User',
                  coins: 500,
                });
                router.replace('/(tabs)/standard');
              }}
              className="mt-8 py-4 border border-[#4A7A4A] rounded-xl"
            >
              <Text className="text-[#8FAE8F] text-center font-semibold">
                Skip Login - Dev Mode
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

