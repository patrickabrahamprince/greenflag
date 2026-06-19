// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PLACEHOLDER_PHOTOS = [
  'https://i.pravatar.cc/400?img=1',
  'https://i.pravatar.cc/400?img=2',
  'https://i.pravatar.cc/400?img=3',
  'https://i.pravatar.cc/400?img=4',
  'https://i.pravatar.cc/400?img=5',
  'https://i.pravatar.cc/400?img=6',
];

export default function PhotosScreen() {
  const [photos, setPhotos] = useState([]);
  const router = useRouter();

  const addPhoto = (index) => {
    if (photos.length <= index) {
      setPhotos(prev => [...prev, PLACEHOLDER_PHOTOS[prev.length]]);
    }
  };

  const slots = Array(6).fill(null).map((_, i) => photos[i] || null);

  return (
    <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-8 pt-20">
          <Text className="text-white text-3xl font-bold mb-2">Add your photos</Text>
          <Text className="text-green-400 mb-8">Add at least 2 photos to continue</Text>

          <View className="flex-row flex-wrap justify-between">
            {slots.map((photo, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => addPhoto(i)}
                className="w-[48%] aspect-square bg-green-800 rounded-2xl items-center justify-center mb-4 overflow-hidden"
                style={!photo ? { borderWidth: 1.5, borderColor: '#4A7A4A', borderStyle: 'dashed' } : {}}
              >
                {photo ? (
                  <View className="w-full h-full">
                    <Image source={{ uri: photo }} className="w-full h-full rounded-2xl" />
                    <View className="absolute inset-0 rounded-2xl border-2 border-gold" />
                  </View>
                ) : (
                  <Ionicons name="add" size={40} color="#D4AF37" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="p-8 pt-0">
          <TouchableOpacity onPress={() => router.push('/onboarding/prompts')} disabled={photos.length < 2} className="w-full mb-4">
            <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className={`rounded-3xl p-4 ${photos.length < 2 ? 'opacity-50' : ''}`}>
              <Text className="text-black text-center font-bold">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/onboarding/prompts')}>
            <Text className="text-green-400 text-center">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
