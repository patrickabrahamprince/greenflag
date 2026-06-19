// @ts-nocheck
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MOCK_MATCHES } from '@/constants/data';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches] = useState(MOCK_MATCHES);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient
        colors={['#0D3D0D', '#1A4D1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      <View className="px-6 pt-12 pb-4">
        <Text className="text-white text-3xl font-bold">Matches</Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        contentContainerClassName="px-6 pb-6"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/chat/${item.id}`)}
            className="flex-row items-center py-4 border-b border-green-600/20 active:opacity-70"
          >
            <View className="mr-4">
              <Image
                source={{ uri: item.avatar }}
                className="w-14 h-14 rounded-full"
                style={item.isNew ? { borderWidth: 2, borderColor: '#D4AF37' } : {}}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold">{item.name}</Text>
                {item.isNew && <View className="w-2.5 h-2.5 rounded-full bg-gold ml-2" />}
              </View>
              <Text className="text-green-400 text-sm mt-0.5" numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text className="text-green-400/60 text-xs">{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-green-400 text-lg">No matches yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
