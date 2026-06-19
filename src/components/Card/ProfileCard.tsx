// @ts-nocheck
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';

interface ProfileCardProps {
  user: {
    name: string;
    age: number;
    city: string;
    bio: string;
    photos: string[];
    interests: string[];
  };
  onPress?: () => void;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onPress,
  showActions = false,
  onApprove,
  onReject,
}) => {
  const primaryPhoto = user.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      className="w-full bg-[#18181B] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
    >
      <View className="relative w-full h-[400px]">
        <Image
          source={{ uri: primaryPhoto }}
          className="w-full h-full object-cover"
        />
        {/* Soft dark gradient overlays */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        
        {/* Basic Overlay Details */}
        <View className="absolute bottom-6 left-6 right-6">
          <View className="flex-row items-end mb-2">
            <Text className="text-3xl font-black text-white">{user.name}</Text>
            <Text className="text-2xl font-bold text-zinc-300 ml-2">, {user.age}</Text>
          </View>
          
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-sharp" size={16} color="#8FAE8F" />
            <Text className="text-sm font-semibold text-zinc-300 ml-1">{user.city}</Text>
          </View>

          {/* Chips */}
          <View className="flex-row flex-wrap gap-1.5 max-h-16 overflow-hidden">
            {user.interests.slice(0, 3).map((item, idx) => (
              <View key={idx} className="bg-[#2D5F2D] px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-white">#{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* Expanded Bio Box */}
      <View className="p-6 bg-zinc-950/40">
        <Text className="text-sm text-zinc-400 italic mb-4 leading-relaxed">
          "{user.bio}"
        </Text>
        
        {showActions && (
          <View className="flex-row justify-around mt-2">
            <TouchableOpacity
              onPress={onReject}
              className="w-14 h-14 bg-zinc-800 rounded-full items-center justify-center border border-zinc-700"
            >
              <Ionicons name="close" size={28} color="#FF6B6B" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onApprove}
              className="w-14 h-14 bg-[#1A4D1A] rounded-full items-center justify-center border border-[#2D5F2D]"
            >
              <Ionicons name="checkmark" size={28} color="#8FAE8F" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCard;
