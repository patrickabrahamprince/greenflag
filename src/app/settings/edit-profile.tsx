// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, TextInput, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PHOTOS = [
  'https://i.pravatar.cc/400?img=12',
  null,
  null,
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('Sam');
  const [age, setAge] = useState('26');
  const [bio, setBio] = useState('Love the outdoors and trying new coffee shops');
  const [location, setLocation] = useState('New York');
  const [focusedField, setFocusedField] = useState(null);

  const fieldStyle = (field) =>
    `bg-green-800/80 border ${focusedField === field ? 'border-gold' : 'border-green-600/20'} rounded-2xl p-4 text-white text-lg`;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        <View className="px-6 pt-12 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/50 items-center justify-center mb-4">
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Edit Profile</Text>
        </View>
        <ScrollView className="flex-1 px-6">
          <View className="flex-row gap-3 mb-8">
            {PHOTOS.map((photo, i) => (
              <TouchableOpacity key={i} className={`w-28 h-28 rounded-2xl bg-green-800/60 items-center justify-center overflow-hidden ${i === 0 ? 'border-2 border-gold' : 'border border-green-600/20'}`}>
                {photo ? (
                  <Image source={{ uri: photo }} className="w-full h-full" />
                ) : (
                  <View className="items-center justify-center">
                    <Ionicons name="add" size={28} color="#D4AF37" />
                    <Text className="text-gold text-xs mt-1">Add</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View className="gap-4 mb-8">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#8FAE8F"
              className={fieldStyle('name')}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#8FAE8F"
              keyboardType="number-pad"
              className={fieldStyle('age')}
              onFocus={() => setFocusedField('age')}
              onBlur={() => setFocusedField(null)}
            />
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor="#8FAE8F"
              multiline
              numberOfLines={4}
              className={`${fieldStyle('bio')} min-h-[100px]`}
              style={{ textAlignVertical: 'top' }}
              onFocus={() => setFocusedField('bio')}
              onBlur={() => setFocusedField(null)}
            />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
              placeholderTextColor="#8FAE8F"
              className={fieldStyle('location')}
              onFocus={() => setFocusedField('location')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <TouchableOpacity className="rounded-3xl overflow-hidden shadow-gold-lg mb-12">
            <LinearGradient colors={['#D4AF37', '#F4E4BC', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="p-5">
              <Text className="text-black font-bold text-center text-lg">Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
