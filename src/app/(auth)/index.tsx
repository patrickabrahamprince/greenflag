// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthIndexScreen() {
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1 p-6">
        <View className="flex-1 pt-20">
          <Text className="text-white text-3xl font-bold mb-10">Enter your phone</Text>

          <View className="flex-row items-center bg-green-800 rounded-2xl mb-6">
            <Text className="text-white text-xl px-4 py-4 border-r border-green-600/30">+1</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#4A7A4A"
              keyboardType="phone-pad"
              className="flex-1 text-white text-xl px-4 py-4"
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/verify')}
            className="rounded-3xl overflow-hidden mb-6"
          >
            <LinearGradient
              colors={['#2D5F2D', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-5 items-center"
            >
              <Text className="text-black font-bold text-lg">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-green-400 text-center text-base">Or continue with email</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
