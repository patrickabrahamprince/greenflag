// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
const GENDERS = ['Woman', 'Man', 'Nonbinary'];
export default function GenderScreen() {
  const [gender, setGender] = useState(''); const [showOnProfile, setShowOnProfile] = useState(true); const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-black p-6">
      <View className="flex-1 pt-20">
        <Text className="text-white text-4xl font-bold mb-4">Sam is a great name</Text>
        <Text className="text-zinc-400 mb-8">What's your gender?</Text>
        {GENDERS.map(g => (
          <TouchableOpacity key={g} onPress={() => setGender(g)} className={`p-5 rounded-2xl mb-4 ${gender === g ? 'bg-green-700 border-green-700' : 'bg-zinc-900'}`}>
            <Text className={`text-lg font-semibold ${gender === g ? 'text-white' : 'text-white'}`}>{g}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setShowOnProfile(!showOnProfile)} className="flex-row items-center mt-4">
          <View className={`w-6 h-6 rounded-full border-2 mr-3 ${showOnProfile ? 'bg-green-700 border-green-700' : 'border-zinc-600'}`}>
            {showOnProfile && <Text className="text-black text-center text-sm">✓</Text>}
          </View>
          <Text className="text-white text-base">Show on profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push('/onboarding/intent')} disabled={!gender} className={`p-4 rounded-full ${gender ? 'bg-green-500' : 'bg-zinc-800'}`}>
        <Text className={`text-center text-lg font-semibold ${gender ? 'text-black' : 'text-zinc-500'}`}>Continue</Text>
      </TouchableOpacity>
      {__DEV__ && <TouchableOpacity onPress={()=>router.replace('/(tabs)')} className="p-3 mb-4 bg-zinc-800 rounded-full"><Text className="text-white text-center">DEV: Skip Onboarding</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}
