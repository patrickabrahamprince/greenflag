// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
export default function PermissionsScreen() {
  const [granted, setGranted] = useState(false); const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-black p-6">
      <View className="flex-1 pt-20 items-center">
        <View className="w-20 h-20 bg-yellow-500 rounded-2xl items-center justify-center mb-8">
          <Text className="text-4xl">📍</Text>
        </View>
        <Text className="text-white text-4xl font-bold mb-4 text-center">Now, can we get your location?</Text>
        <Text className="text-zinc-400 mb-8 text-center">We use this to show you people nearby. You're in control.</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/onboarding/name')} className="bg-green-500 p-4 rounded-full mb-4">
        <Text className="text-black text-center text-lg font-semibold">Allow Location</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/onboarding/name')}>
        <Text className="text-zinc-500 text-center text-base">Not now</Text>
      </TouchableOpacity>
      {__DEV__ && <TouchableOpacity onPress={()=>router.replace('/(tabs)')} className="p-3 mb-4 bg-zinc-800 rounded-full"><Text className="text-white text-center">DEV: Skip Onboarding</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}
