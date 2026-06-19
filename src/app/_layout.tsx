// @ts-nocheck
import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_700Bold_Italic } from '@expo-google-fonts/cormorant-garamond';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Cormorant Garamond': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-BoldItalic': CormorantGaramond_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/invite" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/otp" />
        <Stack.Screen name="(auth)/persona" />
        <Stack.Screen name="(auth)/profile" />
        <Stack.Screen name="(auth)/interests" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="connection/[id]" />
        <Stack.Screen name="standard/[id]" />
        <Stack.Screen name="connection/[id]/ended" />
        <Stack.Screen name="connected" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="buy-coins" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="legal/terms" />
        <Stack.Screen name="legal/privacy" />
        <Stack.Screen name="legal/guidelines" />
        <Stack.Screen name="report" />
      </Stack>
    </SafeAreaProvider>
  );
}
