// @ts-nocheck
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NameScreen() {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  return (
    <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 p-8 pt-20">
          <View className="flex-row justify-center gap-2 mb-10">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <View key={i} className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-gold' : 'bg-green-600/50'}`} />
            ))}
          </View>

          <Text className="text-white text-3xl font-bold mb-4">What's your name?</Text>
          <Text className="text-green-400 mb-8">This is how others will see you.</Text>

          <View className={`bg-green-800 rounded-2xl border ${focused ? 'border-gold' : 'border-green-600/30'} p-1`}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#4A7A4A"
              className="text-white text-xl p-4"
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        <View className="p-8 pt-0">
          <TouchableOpacity onPress={() => router.push('/onboarding/birthday')} disabled={name.length < 1} className="w-full mb-4">
            <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className={`rounded-3xl p-4 ${name.length < 1 ? 'opacity-50' : ''}`}>
              <Text className="text-black text-center font-bold">Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text className="text-green-400 text-center">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
