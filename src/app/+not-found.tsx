// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#000', '#0D3D0D']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1 items-center justify-center">
        <Text className="text-gold text-8xl font-bold text-center">404</Text>
        <Text className="text-white text-2xl text-center mt-4">Page not found</Text>
        <Text className="text-green-400 text-center text-lg mt-2 px-8">
          The path you're looking for doesn't exist in this forest.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          className="w-full mx-12 mt-12 rounded-3xl overflow-hidden"
        >
          <LinearGradient colors={['#D4AF37', '#F4E4BC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-4 items-center mx-12">
            <Text className="text-black font-bold text-lg">Go Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}
