// @ts-nocheck
import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

interface StreakFreezeProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  freezeCost?: number;
  userCoins?: number;
}

export const StreakFreeze: React.FC<StreakFreezeProps> = ({
  visible,
  onClose,
  onConfirm,
  freezeCost = 25,
  userCoins = 0,
}) => {
  const canAfford = userCoins >= freezeCost;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/85 px-6">
        <View className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 w-full max-w-sm">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-[#2D5F2D] rounded-full items-center justify-center mb-4">
              <Ionicons name="snow" size={32} color="#D4AF37" />
            </View>
            <Text className="text-xl font-black text-center">Buy Streak Freeze</Text>
            <Text className="text-sm text-zinc-400 text-center mt-2 leading-relaxed">
              Streak active connection is about to expire! Freeze it for 24 hours to prevent disconnection.
            </Text>
          </View>

          <View className="bg-black/40 border border-zinc-800 rounded-2xl p-4 flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs text-zinc-500 uppercase font-semibold">Cost</Text>
              <Text className="text-lg font-bold text-[#D4AF37]">{freezeCost} Coins</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-zinc-500 uppercase font-semibold">Your Wallet</Text>
              <Text className="text-lg font-bold text-white">{userCoins} Coins</Text>
            </View>
          </View>

          {canAfford ? (
            <Button
              title="Confirm Freeze"
              variant="gold"
              onPress={onConfirm}
              className="mb-3"
            />
          ) : (
            <View className="mb-3">
              <Text className="text-xs text-red-400 text-center mb-2">Insufficient coins in your wallet</Text>
              <Button
                title="Top-up Coins"
                onPress={onClose}
              />
            </View>
          )}

          <TouchableOpacity onPress={onClose} className="py-2 items-center">
            <Text className="text-sm text-zinc-500 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StreakFreeze;
