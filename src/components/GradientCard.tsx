// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { View } from 'react-native';

type GradientCardProps = {
  children: ReactNode;
  className?: string;
  gradient?: { colors: string[]; start?: { x: number; y: number }; end?: { x: number; y: number } };
};

export function GradientCard({ children, className = '', gradient }: GradientCardProps) {
  return (
    <View className={`rounded-3xl overflow-hidden shadow-card ${className}`}>
      <LinearGradient
        colors={gradient?.colors ?? ['#1A4D1A', '#2D5F2D']}
        start={gradient?.start ?? { x: 0, y: 0 }}
        end={gradient?.end ?? { x: 1, y: 1 }}
        className="p-6"
      >
        {children}
      </LinearGradient>
    </View>
  );
}
