// @ts-nocheck
import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  'See who likes you',
  'Unlimited rewinds',
  '5 super likes per day',
  'Incognito mode',
];

export default function BacktrackPaywall() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#000', '#0D3D0D']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1 items-center justify-center">
        <Animated.View className="items-center px-6 w-full" style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Ionicons name="trophy" size={64} color="#D4AF37" />

          <Text className="text-white text-3xl font-bold text-center mt-6">Unlock GreenFlag Gold</Text>

          <View className="mt-10 gap-5 w-full px-4">
            {FEATURES.map((feature, i) => (
              <View key={i} className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={22} color="#D4AF37" />
                <Text className="text-white text-base ml-3">{feature}</Text>
              </View>
            ))}
          </View>

          <View className="bg-green-800 rounded-3xl p-6 mx-6 w-full mt-10 shadow-card">
            <Text className="text-gold text-3xl font-bold text-center">$19.99 / month</Text>
            <Text className="text-green-400 text-sm text-center mt-1">Billed monthly</Text>
          </View>

          <TouchableOpacity className="w-full mx-6 mt-8 rounded-3xl overflow-hidden shadow-gold-lg">
            <LinearGradient colors={['#D4AF37', '#F4E4BC', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-5 rounded-3xl">
              <Text className="text-black font-bold text-center text-lg">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-green-400 text-base">Continue</Text>
          </TouchableOpacity>

          <View className="flex-row gap-8 mt-10">
            <TouchableOpacity>
              <Text className="text-green-400 text-xs">Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-green-400 text-xs">Restore</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
