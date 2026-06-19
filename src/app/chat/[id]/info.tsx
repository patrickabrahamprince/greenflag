// @ts-nocheck
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_MATCHES, MOCK_PROFILES } from '@/constants/data';

export default function ChatInfoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const match = MOCK_MATCHES.find(m => m.id === id) || MOCK_MATCHES[0];
  const profile = MOCK_PROFILES.find(p => p.id === id) || MOCK_PROFILES[0];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        <ScrollView contentContainerClassName="pb-12">
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-6 z-10 w-10 h-10 rounded-full bg-black/50 items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>

          <View className="items-center mt-12">
            <Image source={{ uri: match.avatar }} className="w-32 h-32 rounded-full border-2 border-gold" />
            <Text className="text-white text-3xl font-bold mt-6">{profile.name}, {profile.age}</Text>
            <Text className="text-green-400 text-base text-center px-6 mt-2">{profile.bio}</Text>
          </View>

          <View className="flex-row flex-wrap justify-center gap-3 px-6 mt-8">
            {profile.interests.map(interest => (
              <View key={interest} className="bg-green-700 rounded-full px-5 py-2">
                <Text className="text-white text-sm">{interest}</Text>
              </View>
            ))}
          </View>

          <View className="px-6 mt-10">
            <TouchableOpacity className="rounded-3xl overflow-hidden shadow-gold-lg">
              <LinearGradient colors={['#D4AF37', '#F4E4BC', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-5">
                <Text className="text-black font-bold text-center text-lg">Share Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-10">
            <Text className="text-red-500/70 text-center text-base">Unmatch</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
