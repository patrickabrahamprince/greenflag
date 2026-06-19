// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TextInput, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

const DEFAULT_MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
];

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([],);
  const [loading, setLoading] = useState(false);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const handleAddPhoto = () => {
    if (photos.length >= 3) return;
    // Simulate expo-image-picker photo addition
    const nextPhoto = DEFAULT_MOCK_PHOTOS[photos.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const handleContinue = async () => {
    if (!name || !age || !city || !bio || photos.length < 3) {
      Alert.alert('Fields Required', 'Please complete your name, age, city, bio, and add 3 photos.');
      return;
    }
    
    setLoading(true);
    const ageNum = parseInt(age, 10);
    const updateData = { name, age: ageNum, city, bio, photos };

    try {
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (error) console.log('Error updating profile:', error.message);
      }
      
      setUser(updateData);
      router.push('/(auth)/interests');
    } catch (e) {
      console.log('Exception in profile onboarding:', e);
      setUser(updateData);
      router.push('/(auth)/interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-12 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-zinc-500 font-semibold text-xs">Step 2 of 3</Text>
          <View className="w-10" />
        </View>

        <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
          Your Profile
        </Text>
        <Text className="text-white text-3xl font-black mb-6">
          About You
        </Text>

        {/* 3 Photos Grid */}
        <Text className="text-sm font-bold text-zinc-300 mb-3">Add 3 Profile Photos</Text>
        <View className="flex-row justify-between mb-8 gap-2">
          {[0, 1, 2].map((idx) => {
            const photo = photos[idx];
            return (
              <TouchableOpacity
                key={idx}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
                className="flex-1 aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center overflow-hidden relative"
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} className="w-full h-full" />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera-outline" size={24} color="#52525B" />
                    <Text className="text-[10px] text-zinc-500 mt-1 font-bold">Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Text Inputs */}
        <View className="space-y-4 gap-4 mb-8">
          
          <View>
            <Text className="text-xs text-zinc-400 font-bold mb-2">First Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="E.g., Kabir"
              placeholderTextColor="#52525B"
              className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-base"
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-xs text-zinc-400 font-bold mb-2">Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="E.g., 26"
                placeholderTextColor="#52525B"
                keyboardType="number-pad"
                maxLength={2}
                className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-zinc-400 font-bold mb-2">City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="E.g., Mumbai"
                placeholderTextColor="#52525B"
                className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-base"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs text-zinc-400 font-bold mb-2">Short Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell them who you are..."
              placeholderTextColor="#52525B"
              multiline
              numberOfLines={3}
              className="w-full bg-[#18181B] border border-zinc-800 rounded-2xl px-5 py-4 text-white text-base text-left"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

        </View>

        <Button
          title="Continue"
          loading={loading}
          onPress={handleContinue}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
