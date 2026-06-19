// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
const INTENTS = ['A long-term relationship', 'Fun, casual dates', 'Marriage'];
export default function IntentScreen() {
  const [intent, setIntent] = useState(''); const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-black p-6">
      <View className="flex-1 pt-20">
        <Text className="text-white text-4xl font-bold mb-4">And what are you hoping to find?</Text>
        <Text className="text-zinc-400 mb-8">You can change this later.</Text>
        {INTENTS.map(i => (
          <TouchableOpacity key={i} onPress={() => setIntent(i)} className={`p-5 rounded-2xl mb-4 ${intent === i ? 'bg-green-700 border-green-700' : 'bg-zinc-900'}`}>
            <Text className={`text-lg font-semibold ${intent === i ? 'text-white' : 'text-white'}`}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => router.push('/onboarding/interests')} disabled={!intent} className={`p-4 rounded-full ${intent ? 'bg-green-500' : 'bg-zinc-800'}`}>
        <Text className={`text-center text-lg font-semibold ${intent ? 'text-black' : 'text-zinc-500'}`}>Continue</Text>
      </TouchableOpacity>
      {__DEV__ && <TouchableOpacity onPress={()=>router.replace('/(tabs)')} className="p-3 mb-4 bg-zinc-800 rounded-full"><Text className="text-white text-center">DEV: Skip Onboarding</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}
