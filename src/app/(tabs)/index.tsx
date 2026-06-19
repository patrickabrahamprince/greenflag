// @ts-nocheck
import { useState, useRef, useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_PROFILES } from '@/constants/data';
let Haptics: any = null;
if (Platform.OS !== 'web') Haptics = require('expo-haptics');

const { width, height } = Dimensions.get('screen');
const SWIPE_THRESHOLD = 100;

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(currentIndex);
  indexRef.current = currentIndex;

  const position = useRef(new Animated.ValueXY()).current;

  const animateAndNext = useCallback((toX: number) => {
    if (Platform.OS !== 'web' && Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(i => i + 1);
    });
  }, [position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web' && Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(position, {
            toValue: { x: width + 100, y: g.dy },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            setCurrentIndex(i => i + 1);
          });
        } else if (g.dx < -SWIPE_THRESHOLD) {
          if (Platform.OS !== 'web' && Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(position, {
            toValue: { x: -width - 100, y: g.dy },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            setCurrentIndex(i => i + 1);
          });
        } else {
          Animated.timing(position, {
            toValue: { x: 0, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const profile = MOCK_PROFILES[currentIndex];
  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
          <Text className="text-gold text-2xl font-bold">GreenFlag</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-green-400 text-xl text-center">No more profiles</Text>
        </View>
      </SafeAreaView>
    );
  }

  const next1 = MOCK_PROFILES[currentIndex + 1];
  const next2 = MOCK_PROFILES[currentIndex + 2];

  const StackCard = ({ profile, topOffset, zIndex }) => (
    <View
      className="absolute left-4 right-4 rounded-3xl overflow-hidden"
      style={{
        top: topOffset,
        height: height * 0.6,
        zIndex,
        transform: [{ scale: 0.95 }],
        opacity: 0.6,
      }}
      pointerEvents="none"
    >
      <Image source={{ uri: profile.photos[0] }} className="w-full h-full absolute" />
      <View className="absolute bottom-0 left-0 right-0 p-6" style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text className="text-white text-2xl font-bold">{profile.name}</Text>
        <Text className="text-gold text-xl">{profile.age}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <Text className="text-gold text-2xl font-bold">GreenFlag</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-4">
        <View className="flex-1 rounded-3xl" style={{ height: height * 0.6 }}>
          {next2 && <StackCard profile={next2} topOffset={16} zIndex={0} />}
          {next1 && <StackCard profile={next1} topOffset={8} zIndex={1} />}
          <Animated.View
            className="absolute left-0 right-0 rounded-3xl overflow-hidden shadow-card"
            style={{
              top: 0,
              height: height * 0.6,
              zIndex: 2,
              transform: [...position.getTranslateTransform(), { rotate }] as any,
            }}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={['#1A4D1A', '#2D5F2D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              angle={145}
              className="w-full h-full absolute"
            />
            <Image source={{ uri: profile.photos[0] }} className="w-full h-full absolute" style={{ opacity: 0.8 }} />
            <Animated.View className="absolute top-16 left-6 z-10" style={{ opacity: likeOpacity, transform: [{ rotate: '12deg' }] } as any}>
              <Text className="text-gold text-5xl font-bold border-4 border-gold px-4 py-2 rounded-2xl">LIKE</Text>
            </Animated.View>
            <Animated.View className="absolute top-16 right-6 z-10" style={{ opacity: nopeOpacity, transform: [{ rotate: '-12deg' }] } as any}>
              <Text className="text-red-500 text-5xl font-bold border-4 border-red-500 px-4 py-2 rounded-2xl">NOPE</Text>
            </Animated.View>
            <View className="absolute bottom-0 left-0 right-0 p-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
              <Text className="text-white text-2xl font-bold">{profile.name}</Text>
              <Text className="text-gold text-xl">{profile.age}</Text>
            </View>
          </Animated.View>
        </View>
      </View>
      <View className="flex-row justify-center items-center gap-10 pb-10">
        <TouchableOpacity
          onPress={() => animateAndNext(-width - 100)}
          className="w-16 h-16 bg-zinc-800 rounded-full items-center justify-center"
        >
          <Text className="text-3xl text-white">✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => animateAndNext(width + 100)}
          className="w-16 h-16 rounded-full items-center justify-center bg-gold"
        >
          <Text className="text-3xl text-black">♥</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
