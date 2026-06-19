// @ts-nocheck
import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';

export default function ModalScreen() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: 50% height
  const snapPoints = useMemo(() => ['50%'], []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View className="flex-1 bg-black/70 justify-end">
      {/* Tap outside area to dismiss */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={handleClose}
      />
      
      {Platform.OS === 'web' ? (
        // Simple custom web fallback for BottomSheet
        <View className="bg-[#18181B] border-t border-zinc-800 rounded-t-3xl p-6 pb-12 w-full max-h-[50%]">
          <View className="w-12 h-1.5 bg-zinc-700 rounded-full align-self-center mb-6 mx-auto" />
          <Text className="text-xl font-black text-center mb-2">Reusable Sheet</Text>
          <Text className="text-zinc-400 text-center mb-8">
            This is a bottom sheet dialog designed for Greenflag.
          </Text>
          <Button title="Close Modal" onPress={handleClose} />
        </View>
      ) : (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backgroundStyle={{ backgroundColor: '#18181B' }}
          handleIndicatorStyle={{ backgroundColor: '#52525B' }}
        >
          <BottomSheetView className="flex-1 p-6 pb-12 items-center">
            <Text className="text-xl font-black text-center mb-2">Reusable Sheet</Text>
            <Text className="text-zinc-400 text-center mb-8">
              This is a bottom sheet dialog designed for Greenflag.
            </Text>
            <Button title="Close Modal" onPress={handleClose} />
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}
