// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native';
import { MOCK_PROFILES } from '@/constants/data';

export default function MatchModal() {
  const match = MOCK_PROFILES[0];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#000', '#0D3D0D']} className="flex-1 items-center justify-center p-6">
        <View className="flex-row mb-6">
          <Ionicons name="sparkles" size={24} color="#D4AF37" style={{ transform: [{ rotate: '-20deg' }] }} />
          <Ionicons name="star" size={20} color="#D4AF37" style={{ marginTop: -8 }} />
          <Ionicons name="sparkles" size={24} color="#D4AF37" style={{ transform: [{ rotate: '20deg' }] }} />
        </View>

        <Text className="text-gold text-4xl font-bold text-center mb-8">It's a Match!</Text>

        <View className="flex-row items-center justify-center mb-8">
          <Image
            source={{ uri: 'https://i.pravatar.cc/400?img=12' }}
            className="w-16 h-16 rounded-full border-2 border-gold z-10"
          />
          <Image
            source={{ uri: match.photos[0] }}
            className="w-16 h-16 rounded-full border-2 border-gold -ml-4"
          />
        </View>

        <Text className="text-green-400 text-center text-lg mb-10">
          You and {match.name} liked each other
        </Text>

        <TouchableOpacity
          onPress={() => router.push(`/chat/${match.id}`)}
          className="w-full mb-4 rounded-3xl overflow-hidden"
        >
          <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-5 items-center">
            <Text className="text-black font-bold text-lg">Send a Message</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-green-400 text-center text-base">Keep Playing</Text>
        </TouchableOpacity>

        <View className="absolute bottom-8 left-0 right-0 flex-row justify-center gap-4">
          <Ionicons name="sparkles" size={16} color="#D4AF37" />
          <Ionicons name="star" size={12} color="#D4AF37" />
          <Ionicons name="sparkles" size={16} color="#D4AF37" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
