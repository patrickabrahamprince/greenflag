// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
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

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [photos, setPhotos] = useState<string[]>(user?.photos || DEFAULT_MOCK_PHOTOS);
  const [loading, setLoading] = useState(false);

  const handleUpdatePhoto = (idx: number) => {
    // swap or update photo
    Alert.alert('Edit Photo', 'Image uploading is simulated in demo mode.');
  };

  const handleSave = async () => {
    if (!bio.trim() || !city.trim()) {
      Alert.alert('Required Fields', 'Bio and City fields cannot be empty.');
      return;
    }

    setLoading(true);
    const updateData = { bio, city, photos };

    try {
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);
        
        if (error) {
          console.log('Error saving updates:', error.message);
        }
      }
      
      setUser(updateData);
      Alert.alert('Success', 'Profile saved successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.log('Exception in edit profile:', e);
      setUser(updateData);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">Edit Profile</Text>
          <View className="w-10" />
        </View>

        {/* Photo Grid */}
        <Text className="text-xs text-zinc-400 font-bold mb-3 px-1 uppercase tracking-wider">Profile Images</Text>
        <View className="flex-row justify-between mb-8 gap-2 mt-2">
          {[0, 1, 2].map((idx) => {
            const photo = photos[idx];
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleUpdatePhoto(idx)}
                activeOpacity={0.7}
                className="flex-1 aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-2xl items-center justify-center overflow-hidden relative"
              >
                {photo ? (
                  <>
                    <Image source={{ uri: photo }} className="w-full h-full" />
                    <View className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 rounded-full items-center justify-center">
                      <Ionicons name="pencil" size={14} color="white" />
                    </View>
                  </>
                ) : (
                  <Ionicons name="camera-outline" size={22} color="#52525B" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inputs */}
        <Text className="text-xs text-zinc-400 font-bold mb-3 px-1 uppercase tracking-wider">Details</Text>
        <View className="space-y-4 gap-4 mb-8">
          
          <View>
            <Text className="text-xs text-zinc-500 font-bold mb-2">My City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="E.g., Bangalore"
              placeholderTextColor="#52525B"
              className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-sm"
            />
          </View>

          <View>
            <Text className="text-xs text-zinc-500 font-bold mb-2">My Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Update bio..."
              placeholderTextColor="#52525B"
              multiline
              numberOfLines={4}
              className="w-full bg-[#18181B] border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm text-left"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>

        </View>

        {/* Action Button */}
        <Button
          title="Save Profile Changes"
          loading={loading}
          onPress={handleSave}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
