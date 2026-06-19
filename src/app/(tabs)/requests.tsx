// @ts-nocheck
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_LIKES } from '@/constants/data';

export default function RequestsScreen() {
  const [requests, setRequests] = useState(MOCK_LIKES);

  const handleAccept = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handlePass = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient
        colors={['#0D3D0D', '#1A4D1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="px-6 pt-12 pb-4">
        <Text className="text-white text-3xl font-bold">Requests</Text>
        <Text className="text-green-400 text-base mt-1">{requests.length} incoming</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperClassName="gap-4 mb-4"
        contentContainerClassName="px-6 pb-6"
        renderItem={({ item }) => (
          <View className="flex-1 bg-green-800 rounded-2xl p-4 items-center">
            <Image source={{ uri: item.photo }} className="w-20 h-20 rounded-full mb-3" />
            <Text className="text-white text-lg font-bold">{item.name}</Text>
            <Text className="text-gold text-base mb-4">{item.age}</Text>
            <LinearGradient
              colors={['#2D5F2D', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-3 w-full mb-2"
            >
              <TouchableOpacity className="w-full items-center" onPress={() => handleAccept(item.id)}>
                <Text className="text-black font-bold">Accept</Text>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity
              className="rounded-3xl p-3 w-full items-center bg-zinc-800"
              onPress={() => handlePass(item.id)}
            >
              <Text className="text-green-400 font-bold">Pass</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons name="heart-dislike-outline" size={64} color="#8FAE8F" />
            <Text className="text-green-400 text-lg mt-4">No requests yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
