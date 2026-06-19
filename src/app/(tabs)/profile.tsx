// @ts-nocheck
import { useRouter } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const INTERESTS = ['Mindfulness', 'Dancing', 'Hiking', 'Coffee', 'Art', 'Travel'];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient
        colors={['#0D3D0D', '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute inset-0"
      />
      <ScrollView className="flex-1">
        <View className="items-center mt-8 mb-4">
          <View className="w-48 h-48 rounded-full overflow-hidden shadow-gold-lg">
            <Image source={{ uri: 'https://i.pravatar.cc/400?img=12' }} className="w-full h-full" />
            <LinearGradient
              colors={['rgba(13,61,13,0.6)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="absolute inset-0"
            />
          </View>
        </View>
        <View className="items-center px-6">
          <View className="flex-row items-center">
            <Text className="text-white text-3xl font-bold">Sam</Text>
            <Text className="text-gold text-xl ml-3">26</Text>
          </View>
          <Text className="text-green-400 text-center p-4 leading-6">
            Love the outdoors and trying new coffee shops. Always up for an adventure!
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-center px-6 gap-3 mb-8">
          {INTERESTS.map((interest, i) => (
            <View key={i} className="bg-green-700 rounded-full px-4 py-2">
              <Text className="text-white">{interest}</Text>
            </View>
          ))}
        </View>
        <View className="px-6 gap-4">
          <TouchableOpacity className="bg-green-800 border border-gold/50 rounded-3xl p-4 items-center shadow-gold">
            <Text className="text-gold font-bold text-lg">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="flex-row items-center justify-between bg-green-800/50 rounded-3xl p-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={22} color="#D4AF37" />
              <Text className="text-white text-lg ml-3">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8FAE8F" />
          </TouchableOpacity>
        </View>
        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}
