// @ts-nocheck
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PROFILES } from '@/constants/data';

const { width } = Dimensions.get('screen');

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const profile = MOCK_PROFILES.find(p => p.id === id) || MOCK_PROFILES[0];
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setPhotoIndex(idx);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#000']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          <ScrollView className="flex-1">
            <View className="relative">
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                snapToInterval={width}
                decelerationRate="fast"
              >
                {profile.photos.map((photo, i) => (
                  <View key={i} style={{ width }}>
                    <Image source={{ uri: photo }} className="w-full" style={{ height: 460 }} />
                  </View>
                ))}
              </ScrollView>

              <LinearGradient colors={['#0D3D0D', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="absolute top-0 left-0 right-0" style={{ height: 100 }} />
              <LinearGradient colors={['transparent', '#000']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="absolute bottom-0 left-0 right-0" style={{ height: 120 }} />

              <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-6 w-10 h-10 rounded-full bg-black/50 items-center justify-center z-10">
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>

              <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-2 z-10">
                {profile.photos.map((_, i) => (
                  <View key={i} className={`w-2 h-2 rounded-full ${i === photoIndex ? 'bg-gold' : 'bg-white/40'}`} />
                ))}
              </View>
            </View>

            <View className="px-6 pt-6 pb-4">
              <Text className="text-white text-3xl font-bold">{profile.name}, {profile.age}</Text>
              <Text className="text-green-400 text-base mt-3 leading-6">{profile.bio}</Text>

              <Text className="text-white text-lg font-bold mt-8 mb-4">Interests</Text>
              <View className="flex-row flex-wrap gap-3">
                {profile.interests.map(interest => (
                  <View key={interest} className="bg-green-700 rounded-full px-5 py-2">
                    <Text className="text-white text-sm">{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-4 px-6 py-4 pb-10 border-t border-green-600/20">
            <TouchableOpacity className="flex-1 rounded-3xl overflow-hidden shadow-gold-lg">
              <LinearGradient colors={['#D4AF37', '#F4E4BC', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-4">
                <Text className="text-black font-bold text-center text-base">Message</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-3xl bg-green-800/50 border border-green-600/30 p-4">
              <Text className="text-white font-bold text-center text-base">Pass</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
