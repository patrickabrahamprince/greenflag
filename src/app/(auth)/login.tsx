// @ts-nocheck
import { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    if (email !== 'test@greenflag.app' || password !== 'demo123') {
      return Alert.alert('Invalid Credentials', 'Use test@greenflag.app / demo123');
    }
    setLoading(true);
    setTimeout(() => router.replace('/(tabs)'), 50);
  };

  return (
    <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center">
          <View className="bg-green-800/90 rounded-3xl p-8 mx-6 border border-green-600/30">
            <Text className="text-gold text-4xl font-bold text-center mb-8">GreenFlag</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#4A7A4A"
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-green-800 text-white p-4 rounded-2xl mb-4"
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#4A7A4A"
              secureTextEntry
              className="bg-green-800 text-white p-4 rounded-2xl"
            />

            <TouchableOpacity onPress={handleSignIn} disabled={loading} className="w-full mt-6">
              <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-3xl p-4">
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black text-center font-bold">Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-green-400">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-gold font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-green-400 text-xs text-center mt-4">
              Test: test@greenflag.app / demo123
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
