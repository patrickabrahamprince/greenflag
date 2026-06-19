// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientCard } from '@/components/GradientCard';
import { GoldButton } from '@/components/GoldButton';
import { GRADIENTS } from '@/constants/gradients';

const { width } = Dimensions.get('screen');

const MOCK_EVENTS = {
  '1': {
    id: '1',
    title: 'Sunset Wine Tasting',
    date: 'Sat, Jun 28 · 6:00 PM',
    location: 'Green Valley Vineyard',
    price: '$45',
    spots: 12,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
    host: { name: 'Sophia', avatar: 'https://i.pravatar.cc/100?img=21' },
    attendees: [
      { name: 'Emily', avatar: 'https://i.pravatar.cc/100?img=5' },
      { name: 'Alex', avatar: 'https://i.pravatar.cc/100?img=12' },
      { name: 'Jordan', avatar: 'https://i.pravatar.cc/100?img=13' },
    ],
    description: 'Join us for an evening of fine wines and beautiful sunset views. We will sample six hand-selected wines paired with artisanal cheeses.',
  },
  '2': {
    id: '2',
    title: 'Hiking Adventure',
    date: 'Sun, Jun 30 · 7:00 AM',
    location: 'Cedar Ridge Trailhead',
    price: 'Free',
    spots: 8,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    host: { name: 'Marcus', avatar: 'https://i.pravatar.cc/100?img=33' },
    attendees: [
      { name: 'Sarah', avatar: 'https://i.pravatar.cc/100?img=1' },
      { name: 'Mike', avatar: 'https://i.pravatar.cc/100?img=42' },
    ],
    description: 'Moderate 5-mile hike through redwood forests. Bring water and good shoes. We will stop for photos at the summit overlook.',
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [rsvped, setRsvped] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const event = MOCK_EVENTS[id] || MOCK_EVENTS['1'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={GRADIENTS.hero.colors} start={GRADIENTS.hero.start} end={GRADIENTS.hero.end} className="flex-1">
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="relative">
              <Image source={{ uri: event.image }} className="w-full" style={{ height: 280 }} />
              <LinearGradient
                colors={['transparent', '#000']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 120 }}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={24} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            <View className="px-6 -mt-8 relative z-10">
              <GradientCard className="mb-6" gradient={GRADIENTS.card}>
                <Text className="text-white text-3xl font-bold mb-2">{event.title}</Text>

                <View className="flex-row items-center mb-3">
                  <Ionicons name="calendar-outline" size={18} color="#D4AF37" />
                  <Text className="text-gold text-base ml-2">{event.date}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Ionicons name="location-outline" size={18} color="#D4AF37" />
                  <Text className="text-gold text-base ml-2">{event.location}</Text>
                </View>

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="pricetag-outline" size={18} color="#D4AF37" />
                    <Text className="text-gold text-base ml-2">{event.price}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={18} color="#8FAE8F" />
                    <Text className="text-green-400 text-base ml-1">{event.spots} spots left</Text>
                  </View>
                </View>

                <GoldButton
                  onPress={() => setRsvped(!rsvped)}
                  label={rsvped ? '✓ RSVP Confirmed' : 'RSVP Now'}
                  disabled={rsvped}
                />
              </GradientCard>

              <GradientCard className="mb-6" gradient={GRADIENTS.card}>
                <Text className="text-white text-xl font-bold mb-3">Hosted by</Text>
                <View className="flex-row items-center">
                  <Image source={{ uri: event.host.avatar }} className="w-12 h-12 rounded-full border-2 border-gold" />
                  <Text className="text-white text-lg font-semibold ml-3">{event.host.name}</Text>
                </View>
              </GradientCard>

              <GradientCard className="mb-6" gradient={GRADIENTS.card}>
                <Text className="text-white text-xl font-bold mb-3">About this event</Text>
                <Text className="text-green-400 text-base leading-6">{event.description}</Text>
              </GradientCard>

              <GradientCard className="mb-8" gradient={GRADIENTS.card}>
                <Text className="text-white text-xl font-bold mb-4">Attendees</Text>
                <View className="flex-row flex-wrap gap-4">
                  {event.attendees.map((a, i) => (
                    <View key={i} className="items-center">
                      <Image source={{ uri: a.avatar }} className="w-14 h-14 rounded-full border border-green-600/30" />
                      <Text className="text-green-400 text-xs mt-1">{a.name}</Text>
                    </View>
                  ))}
                </View>
              </GradientCard>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
