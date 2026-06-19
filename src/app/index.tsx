import { supabase } from '@/lib/supabase';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait until root navigation state is ready before navigating
    if (!rootNavigationState?.key) return;

    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.log('Auth error:', error);
          router.replace('/(auth)/login');
          return;
        }

        if (session) {
          router.replace('/(tabs)/discover');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.log('Check auth failed:', e);
        if (mounted) router.replace('/(auth)/login');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        router.replace('/(tabs)/discover');
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#D4AF37" />
      <Text style={{ color: '#D4AF37', marginTop: 12 }}>
        {checking ? 'Loading...' : 'Redirecting...'}
      </Text>
    </View>
  );
}