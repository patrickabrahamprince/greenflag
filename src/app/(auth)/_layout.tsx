// @ts-nocheck
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="invite" />
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="persona" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="interests" />
    </Stack>
  );
}

