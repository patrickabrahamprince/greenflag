import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, getCurrentUserId } from '../lib/supabase';

export default function PersonaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectPersona = async (persona: 'woman' | 'man') => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Session Error', 'User session not found. Please re-enter invite code.');
        router.replace('/');
        return;
      }

      // Save persona to users.persona, set initial testing coins to 500 as per CRITICAL requirement
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          persona: persona,
          coins: 500, // Hardcoded for testing
        });

      if (error) {
        Alert.alert('Database Error', error.message || 'Failed to save persona.');
        setLoading(false);
        return;
      }

      router.push('/profile');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CHOOSE YOUR PATH</Text>
          <Text style={styles.subtitle}>Select how you wish to engage in Greenflag</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Initializing account...</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={[styles.card, styles.womanCard]}
              onPress={() => selectPersona('woman')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>👑</Text>
              <Text style={styles.cardTitle}>I set the Standard</Text>
              <Text style={styles.cardDesc}>
                As a woman, write your 8-day prompt list (Standard) and evaluate the men who rise to meet them.
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Woman Persona</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.manCard]}
              onPress={() => selectPersona('man')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>⚡</Text>
              <Text style={styles.cardTitle}>I rise to it</Text>
              <Text style={styles.cardDesc}>
                As a man, browse women's standards, spend coins to initiate, and write daily responses to prove your fit.
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Man Persona</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: 12,
    fontSize: 16,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.4)',
    elevation: 6,
  },
  womanCard: {
    borderColor: '#D4AF37', // Gold highlight
  },
  manCard: {
    borderColor: '#333333',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
});
