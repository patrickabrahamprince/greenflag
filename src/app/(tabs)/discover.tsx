/*
-- Update begin_connection function in Supabase SQL Editor:
-- create or replace function begin_connection(receiver_id uuid) returns void as $$
-- begin
--   if (select coins from profiles where id = auth.uid()) < 1 then
--     raise exception 'insufficient_coins';
--   end if;
--   update profiles set coins = coins - 1 where id = auth.uid();
--   insert into connections(initiator_id, receiver_id, status) values (auth.uid(), receiver_id, 'pending');
-- end; $$ language plpgsql security definer;
*/
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ImageBackground, Dimensions, Modal, Image, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('screen');

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  age: number;
  profession: string;
  bio: string;
}

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();

    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase.channel('initiator_connections').on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `initiator_id=eq.${user.id}`,
      }, async (payload) => {
        if (payload.new.status === 'accepted') {
            // Fetch receiver profile to show in modal
            const { data: receiver } = await supabase.from('profiles').select('*').eq('id', payload.new.receiver_id).single();
            if (receiver) {
                setMatchData({ otherUser: receiver, connectionId: payload.new.id });
            }
        }
      }).subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user coins
      const { data: profileData } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setCoins(profileData.coins || 0);
      }

      // Fetch other profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, age, profession, bio')
        .neq('id', user.id);

      if (error) {
        console.log('Error fetching profiles:', error);
      } else {
        setProfiles(data || []);
      }
    } catch (e) {
      console.log('Fetch exception:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBegin = async () => {
    if (coins < 1) {
      Alert.alert('No coins', 'You need coins to Begin');
      return;
    }

    if (profiles.length === 0) return;
    
    const currentProfile = profiles[0];
    setActing(true);
    
    console.log('Calling begin_connection for:', currentProfile.id);
    
    try {
      const { data, error } = await supabase.rpc('begin_connection', { 
        receiver_id: currentProfile.id 
      });

      console.log('RPC result:', data, error);

      if (error) {
        console.log('RPC Error:', error);
        Alert.alert('Error', error.message);
      } else {
        // Remove from stack and decrement coins
        setProfiles(prev => prev.slice(1));
        setCoins(prev => prev - 1);
        Alert.alert('Success', 'Connection begun!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.log('Exception:', message);
      Alert.alert('Error', message);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#D4AF37" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} /> : <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.coinsText}>Coins: {coins}</Text>
      </View>

      {profiles.length === 0 ? (
        <View style={[styles.cardContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.emptyTitle}>No more profiles</Text>
        </View>
      ) : (
        <>
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <ImageBackground
                        source={{ uri: profiles[0].avatar_url || 'https://via.placeholder.com/400' }}
                        style={styles.cardImage}
                        imageStyle={{ borderRadius: 24 }}
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                            style={styles.gradient}
                        >
                            <View style={styles.cardContent}>
                                <Text style={styles.name}>
                                    {profiles[0].full_name}, {profiles[0].age || 25}
                                </Text>
                                <Text style={styles.profession}>{profiles[0].profession || 'Professional'}</Text>
                                <Text style={styles.bio} numberOfLines={2}>{profiles[0].bio || 'No bio yet'}</Text>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, coins === 0 && styles.buttonDisabled]} 
                onPress={handleBegin} 
                disabled={acting || coins === 0}
            >
                {acting ? (
                <ActivityIndicator color="#000" />
                ) : (
                <Text style={styles.buttonText}>Begin Connection</Text>
                )}
            </TouchableOpacity>
        </>
      )}

      {matchData && (
        <Modal visible transparent animationType="fade">
            <BlurView intensity={100} tint="dark" style={styles.modalContainer}>
                <Text style={styles.matchTitle}>It's a Match!</Text>
                <View style={styles.avatarsContainer}>
                    <Image source={{ uri: matchData.otherUser?.avatar_url || 'https://via.placeholder.com/400' }} style={styles.matchAvatar} />
                </View>
                <TouchableOpacity style={styles.matchButton} onPress={() => {
                    const id = matchData.connectionId;
                    setMatchData(null);
                    router.push(`/(tabs)/chat/${id}`);
                }}>
                    <Text style={styles.matchButtonText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keepSwipingButton} onPress={() => setMatchData(null)}>
                    <Text style={styles.keepSwipingText}>Keep Swiping</Text>
                </TouchableOpacity>
            </BlurView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  coinsText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 20,
    flex: 1,
  },
  card: { 
    height: height * 0.65, 
    borderRadius: 24, 
    boxShadow: '0px 8px 16px rgba(0,0,0,0.4)',
    width: '100%',
  },
  cardImage: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  gradient: { 
    borderRadius: 24, 
    padding: 24 
  },
  cardContent: { 
    gap: 4 
  },
  name: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#fff', 
    letterSpacing: -0.5 
  },
  profession: { 
    fontSize: 16, 
    color: '#E5E5EA', 
    marginBottom: 8 
  },
  bio: { 
    fontSize: 15, 
    color: '#D1D1D6', 
    lineHeight: 20 
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Match Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.7)' },
  matchTitle: { fontSize: 48, fontWeight: '800', color: '#D4AF37', marginBottom: 40, fontStyle: 'italic', letterSpacing: -1 },
  avatarsContainer: { flexDirection: 'row', gap: 20, marginBottom: 50 },
  matchAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#D4AF37' },
  matchButton: { backgroundColor: '#D4AF37', width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  matchButtonText: { color: '#000', fontSize: 18, fontWeight: '700' },
  keepSwipingButton: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  keepSwipingText: { color: '#D4AF37', fontSize: 18, fontWeight: '600' },
});
