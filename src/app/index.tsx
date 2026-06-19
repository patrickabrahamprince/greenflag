// @ts-nocheck
import { supabase } from '@/lib/supabase';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Text, View } from 'react-native';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const [checking, setChecking] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          router.replace('/(auth)/splash');
          return;
        }

        router.replace('/(tabs)');
      } catch (e) {
        if (mounted) router.replace('/(auth)/splash');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/splash');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [rootNavigationState?.key]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Animated.Text
        className="text-gold text-5xl font-bold mb-6"
        style={{ opacity }}
      >
        GreenFlag
      </Animated.Text>
      <ActivityIndicator color="#D4AF37" size="large" />
    </View>
  );
}
