import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, getCurrentUserId } from '../lib/supabase';

const DEFAULT_PROMPTS = [
  "What are your top 3 non-negotiable core values?",
  "Describe your ideal relationship dynamic in three words.",
  "How do you define success in your career and life?",
  "What is a book or idea that completely changed how you see the world?",
  "How do you handle stress or difficult emotional times?",
  "What does emotional safety look like to you in a relationship?",
  "What is your absolute biggest green flag in a partner?",
  "Where do you see yourself in 5 years? Describe your lifestyle."
];

export default function StandardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for 8 prompts
  const [prompts, setPrompts] = useState<string[]>(DEFAULT_PROMPTS);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    const uid = await getCurrentUserId();
    if (!uid) {
      Alert.alert('Session Error', 'Please log in again.');
      router.replace('/');
      return;
    }
    setUserId(uid);
  };

  const handlePromptChange = (text: string, index: number) => {
    const updated = [...prompts];
    updated[index] = text;
    setPrompts(updated);
  };

  const handleSave = async () => {
    // Validation
    for (let i = 0; i < 8; i++) {
      if (!prompts[i].trim()) {
        Alert.alert('Incomplete Prompts', `Please fill out the prompt for Day ${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      // Structure the intentions JSONB
      const intentions = prompts.map((prompt, index) => ({
        day: index + 1,
        prompt: prompt.trim(),
      }));

      // Insert to standards table
      const { error } = await supabase
        .from('standards')
        .insert({
          user_id: userId,
          intentions: intentions,
          is_active: true
        });

      if (error) {
        Alert.alert('Database Error', error.message || 'Failed to save standards.');
        setLoading(false);
        return;
      }

      // Navigate to connections tab
      router.push('/(tabs)/connections');
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>SET THE STANDARD</Text>
          <Text style={styles.subtitle}>
            Define the 8-day prompt progression that men must answer to connect with you.
          </Text>

          {prompts.map((prompt, index) => (
            <View key={index} style={styles.promptCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayText}>DAY {index + 1}</Text>
                <Text style={styles.daySub}>Standard Requirement</Text>
              </View>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={(text) => handlePromptChange(text, index)}
                placeholder={`Enter prompt for Day ${index + 1}`}
                placeholderTextColor="#555"
                multiline
                numberOfLines={2}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Submit Standards & Enter App</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 4,
    lineHeight: 18,
  },
  promptCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingBottom: 6,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  daySub: {
    fontSize: 11,
    color: '#666',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 50,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
