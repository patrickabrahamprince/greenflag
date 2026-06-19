// @ts-nocheck
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator color="#D4AF37" size="large" />
      </View>
    );
  }

  if (user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
