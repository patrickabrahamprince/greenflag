// @ts-nocheck
import { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center">
          <View className="bg-green-800/90 rounded-3xl p-8 mx-6 border border-green-600/30">
            <Text className="text-gold text-4xl font-bold text-center mb-2">GreenFlag</Text>
            <Text className="text-white text-2xl font-bold text-center mb-6">Create Account</Text>

            <View className="flex-row justify-center mb-8">
              <TouchableOpacity onPress={() => router.push('/login')} className="pb-2 mx-6">
                <Text className="text-green-400 text-lg">Sign In</Text>
              </TouchableOpacity>
              <View className="pb-2 mx-6 border-b-2 border-gold">
                <Text className="text-gold text-lg font-bold">Sign Up</Text>
              </View>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#4A7A4A"
              className="bg-green-800 text-white p-4 rounded-2xl mb-4"
            />

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
              className="bg-green-800 text-white p-4 rounded-2xl mb-4"
            />

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#4A7A4A"
              secureTextEntry
              className="bg-green-800 text-white p-4 rounded-2xl"
            />

            <TouchableOpacity className="w-full mt-6">
              <LinearGradient colors={['#2D5F2D', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-3xl p-4">
                <Text className="text-black text-center font-bold">Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-green-400">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-gold font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
