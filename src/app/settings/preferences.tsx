// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GENDERS = ['Men', 'Women', 'Everyone'];

export default function PreferencesScreen() {
  const router = useRouter();
  const [showMe, setShowMe] = useState('Women');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [distance, setDistance] = useState(50);
  const [notifications, setNotifications] = useState(true);
  const [incognito, setIncognito] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        <View className="px-6 pt-12 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/50 items-center justify-center mb-4">
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Preferences</Text>
        </View>
        <ScrollView className="flex-1 px-6">
          <View className="bg-green-800 rounded-2xl p-6 mb-4 border border-green-600/10">
            <Text className="text-white text-lg font-bold mb-4">Show Me</Text>
            <View className="flex-row bg-green-900 rounded-full p-1">
              {GENDERS.map(gender => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => setShowMe(gender)}
                  className={`flex-1 py-3 rounded-full ${showMe === gender ? 'bg-gold' : ''}`}
                >
                  <Text className={`text-center font-bold ${showMe === gender ? 'text-black' : 'text-green-400'}`}>{gender}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-green-800 rounded-2xl p-6 mb-4 border border-green-600/10">
            <Text className="text-white text-lg font-bold mb-4">Age Range</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-green-400 text-sm">Min: {ageMin}</Text>
              <Text className="text-green-400 text-sm">Max: {ageMax}</Text>
            </View>
            <View className="flex-row items-center justify-center gap-6 mt-4">
              <TouchableOpacity onPress={() => setAgeMin(Math.max(18, ageMin - 1))} className="w-10 h-10 rounded-full bg-green-700 items-center justify-center">
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-2xl font-bold">{ageMin} - {ageMax}</Text>
              <TouchableOpacity onPress={() => setAgeMax(Math.min(99, ageMax + 1))} className="w-10 h-10 rounded-full bg-green-700 items-center justify-center">
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-green-800 rounded-2xl p-6 mb-4 border border-green-600/10">
            <Text className="text-white text-lg font-bold mb-4">Maximum Distance</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-green-400 text-sm">{distance} miles</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => setDistance(Math.max(1, distance - 5))} className="w-10 h-10 rounded-full bg-green-700 items-center justify-center">
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <View className="flex-1 h-2 bg-green-900 rounded-full overflow-hidden">
                <View className="h-full bg-gold rounded-full" style={{ width: `${(distance / 100) * 100}%` }} />
              </View>
              <TouchableOpacity onPress={() => setDistance(Math.min(100, distance + 5))} className="w-10 h-10 rounded-full bg-green-700 items-center justify-center">
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-green-800 rounded-2xl p-6 mb-12 border border-green-600/10">
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-white text-base">Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#1A4D1A', true: '#2D5F2D' }}
                thumbColor={notifications ? '#D4AF37' : '#4A7A4A'}
              />
            </View>
            <View className="flex-row items-center justify-between py-3 border-t border-green-600/10">
              <Text className="text-white text-base">Incognito Mode</Text>
              <Switch
                value={incognito}
                onValueChange={setIncognito}
                trackColor={{ false: '#1A4D1A', true: '#2D5F2D' }}
                thumbColor={incognito ? '#D4AF37' : '#4A7A4A'}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
