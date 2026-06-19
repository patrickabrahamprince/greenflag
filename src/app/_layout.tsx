import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// @ts-nocheck

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="persona" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="standard" />
        <Stack.Screen name="connection/[id]" options={{ title: 'Connection Detail', headerShown: true }} />
        <Stack.Screen name="events/[id]" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="modal/match" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="paywall/backtrack" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
