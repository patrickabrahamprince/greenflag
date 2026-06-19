// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Text, TouchableOpacity } from 'react-native';

type GoldButtonProps = {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

let Haptics: any = null;
if (Platform.OS !== 'web') Haptics = require('expo-haptics');

export function GoldButton({ onPress, label, disabled = false, className = '' }: GoldButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS !== 'web' && Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      disabled={disabled}
      className={`rounded-3xl overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <LinearGradient
        colors={disabled ? ['#1A4D1A', '#1A4D1A'] : ['#2D5F2D', '#D4AF37']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-5 items-center"
      >
        <Text className={`font-bold text-lg ${disabled ? 'text-green-400' : 'text-black'}`}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
