// @ts-nocheck
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  let bgClass = 'bg-[#1A4D1A]'; // default brand-medium-green
  let textClass = 'text-white font-bold';

  if (variant === 'secondary') {
    bgClass = 'bg-[#2D5F2D]'; // brand-green-700
  } else if (variant === 'gold') {
    bgClass = 'bg-[#D4AF37]'; // gold
    textClass = 'text-black font-black';
  } else if (variant === 'danger') {
    bgClass = 'bg-red-800';
  }

  if (disabled) {
    bgClass = 'bg-zinc-800 opacity-55';
    textClass = 'text-zinc-500 font-semibold';
  }

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.7}
      className={`h-14 w-full rounded-2xl flex-row items-center justify-center ${bgClass} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'gold' ? '#000000' : '#ffffff'} />
      ) : (
        <Text className={`text-base tracking-wide ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
