// @ts-nocheck
import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

export default function WelcomeScreen() {
  const router = useRouter();

  const AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120',
  ];

  return (
    <View className="flex-1 bg-white w-full h-full">
      <SafeAreaView className="flex-1 justify-between py-12 px-6">
        
        {/* Top Graphic Circle Avatars Area */}
        <View className="relative h-[50%] w-full items-center justify-center mt-6">
          {/* Circular SVG path */}
          <Svg className="absolute w-[280] h-[280]">
            <Circle
              cx="140"
              cy="140"
              r="100"
              fill="none"
              stroke="#FBCFE8"
              strokeWidth="2"
              strokeDasharray="4,6"
            />
            <Circle
              cx="140"
              cy="140"
              r="135"
              fill="none"
              stroke="#FCE7F3"
              strokeWidth="1.5"
            />
          </Svg>

          {/* Central Avatar */}
          <View className="w-24 h-24 rounded-full border-4 border-[#FBCFE8] overflow-hidden p-0.5 bg-white z-20 shadow-lg">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
              className="w-full h-full rounded-full"
            />
          </View>

          {/* Orbiting Avatars */}
          {/* Top Left */}
          <View className="absolute top-12 left-10 w-12 h-12 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[0] }} className="w-full h-full" />
          </View>
          {/* Top Right */}
          <View className="absolute top-14 right-10 w-10 h-10 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[1] }} className="w-full h-full" />
          </View>
          {/* Mid Right */}
          <View className="absolute top-44 right-2 w-12 h-12 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[2] }} className="w-full h-full" />
          </View>
          {/* Mid Left */}
          <View className="absolute top-40 left-4 w-10 h-10 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[3] }} className="w-full h-full" />
          </View>
          {/* Bottom Left */}
          <View className="absolute bottom-10 left-16 w-12 h-12 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[4] }} className="w-full h-full" />
          </View>
          {/* Bottom Right */}
          <View className="absolute bottom-12 right-20 w-10 h-10 rounded-full border border-pink-200 overflow-hidden">
            <Image source={{ uri: AVATARS[5] }} className="w-full h-full" />
          </View>

          {/* Small Speech Bubble / Decorative icons */}
          <View className="absolute top-32 left-14 bg-pink-100 p-1 rounded-full">
            <Ionicons name="chatbubble" size={10} color="#EC4899" />
          </View>
          <View className="absolute top-28 right-24 bg-pink-100 p-1 rounded-full">
            <Ionicons name="heart" size={10} color="#EC4899" />
          </View>
        </View>

        {/* Headline and CTAs */}
        <View className="mb-6 items-center px-4">
          <Text className="text-zinc-900 text-3xl font-black text-center mb-2 leading-tight">
            Let's meet new
          </Text>
          <Text className="text-zinc-900 text-3xl font-black text-center mb-8 leading-tight">
            people around you
          </Text>

          {/* Phone Login Button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/invite')}
            className="w-full h-14 bg-[#4A154B] rounded-full flex-row items-center justify-center mb-4 shadow-sm"
          >
            <Ionicons name="call" size={20} color="white" className="mr-3" />
            <Text className="text-white text-base font-bold ml-2">Login with Phone</Text>
          </TouchableOpacity>

          {/* Google Login Button */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/standard')}
            className="w-full h-14 bg-white border border-zinc-200 rounded-full flex-row items-center justify-center mb-6 shadow-sm"
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" className="mr-3" />
            <Text className="text-zinc-800 text-base font-bold ml-2">Login with Google</Text>
          </TouchableOpacity>

          {/* Footer Signup Link */}
          <View className="flex-row">
            <Text className="text-zinc-400 text-sm font-semibold">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/invite')}>
              <Text className="text-[#EC4899] text-sm font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}
