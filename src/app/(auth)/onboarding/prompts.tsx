// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PROMPTS } from '@/constants/data';

export default function PromptsScreen() {
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  const togglePrompt = (prompt) => {
    setSelected(prev => prev === prompt ? null : prompt);
  };

  return (
    <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-8 pt-20">
          <Text className="text-white text-3xl font-bold mb-2">Choose your prompts</Text>
          <Text className="text-green-400 mb-8">Pick one to add to your profile</Text>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {PROMPTS.map(prompt => {
              const isSelected = selected === prompt;
              return (
                <TouchableOpacity
                  key={prompt}
                  onPress={() => togglePrompt(prompt)}
                  className={`rounded-2xl p-5 mb-4 border ${isSelected ? 'border-gold shadow-gold' : 'border-green-600/20'}`}
                  style={{ backgroundColor: '#1A4D1A' }}
                >
                  <Text className={`text-base ${isSelected ? 'text-gold font-bold' : 'text-white'}`}>{prompt}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="p-8 pt-0">
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} disabled={!selected} className="w-full">
            <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className={`rounded-3xl p-4 ${!selected ? 'opacity-50' : ''}`}>
              <Text className="text-black text-center font-bold">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
