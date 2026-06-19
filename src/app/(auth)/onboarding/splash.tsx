// @ts-nocheck
import { useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <LinearGradient colors={['#0D3D0D', '#000']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <Text className="text-gold text-5xl font-bold text-center">GreenFlag</Text>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text className="text-green-400 text-lg text-center mt-4">Find your forest</Text>
          </Animated.View>
        </View>

        <View className="px-8 pb-12">
          <TouchableOpacity onPress={() => router.push('/signup')} className="w-full mb-4">
            <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-3xl p-4">
              <Text className="text-black text-center font-bold text-lg">Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-green-400 text-center">I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
