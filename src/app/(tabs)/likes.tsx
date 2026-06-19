// @ts-nocheck
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_LIKES } from '@/constants/data';

const isPremium = false;

export default function LikesScreen() {
  const [likes] = useState(MOCK_LIKES);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient
        colors={['#0D3D0D', '#1A4D1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="px-6 pt-12 pb-4">
        <Text className="text-white text-3xl font-bold">Likes</Text>
      </View>
      {isPremium ? (
        <FlatList
          data={likes}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerClassName="px-6 pb-6"
          columnWrapperClassName="gap-4 mb-4"
          renderItem={({ item }) => (
            <View className="flex-1 aspect-square rounded-2xl overflow-hidden">
              <Image source={{ uri: item.photo }} className="w-full h-full absolute" />
              <View className="absolute bottom-0 left-0 right-0 p-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <Text className="text-white font-bold text-base">{item.name}, {item.age}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 px-6">
          <FlatList
            data={likes}
            numColumns={2}
            keyExtractor={item => item.id}
            columnWrapperClassName="gap-4 mb-4"
            renderItem={({ item }) => (
              <View className="flex-1 aspect-square rounded-2xl overflow-hidden">
                <Image source={{ uri: item.photo }} className="w-full h-full absolute" style={{ tintColor: '#1E3A5F' }} />
                <View className="absolute inset-0 bg-blue-900/40" />
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="lock-closed" size={32} color="#D4AF37" />
                </View>
                <View className="absolute bottom-0 left-0 right-0 p-3" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <Text className="text-white font-bold text-base">{item.name}, {item.age}</Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              <View className="items-center pt-6 pb-10">
                <LinearGradient
                  colors={['#D4AF37', '#F4E4BC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-3xl p-5 w-full shadow-gold"
                >
                  <TouchableOpacity className="w-full items-center">
                    <Text className="text-black font-bold text-lg">See Who Likes You</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
