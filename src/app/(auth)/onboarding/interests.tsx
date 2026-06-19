// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
const TAGS = ['Mindfulness', 'Dancing', 'Cats', 'Wine', 'Gym', 'Hiking', 'Coffee', 'Art'];
export default function InterestsScreen() {
  const [selected, setSelected] = useState([]); const router = useRouter();
  const toggle = tag => setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);
  return (
    <SafeAreaView className="flex-1 bg-black p-6">
      <View className="flex-1 pt-20">
        <Text className="text-white text-4xl font-bold mb-4">Choose 5 things you're really into</Text>
        <Text className="text-zinc-400 mb-8">Select up to 5 interests</Text>
        <View className="flex-row flex-wrap gap-3">
          {TAGS.map(tag => (
            <TouchableOpacity key={tag} onPress={() => toggle(tag)} className={`p-4 rounded-full border ${selected.includes(tag) ? 'bg-green-700 border-green-700' : 'bg-zinc-900 border-transparent'}`}>
              <Text className={`text-base font-semibold ${selected.includes(tag) ? 'text-white' : 'text-white'}`}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity onPress={() => router.push('/onboarding/photos')} disabled={selected.length === 0} className={`p-4 rounded-full ${selected.length > 0 ? 'bg-green-500' : 'bg-zinc-800'}`}>
        <Text className={`text-center text-lg font-semibold ${selected.length > 0 ? 'text-black' : 'text-zinc-500'}`}>Continue</Text>
      </TouchableOpacity>
      {__DEV__ && <TouchableOpacity onPress={()=>router.replace('/(tabs)')} className="p-3 mb-4 bg-zinc-800 rounded-full"><Text className="text-white text-center">DEV: Skip Onboarding</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}
