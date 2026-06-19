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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name,bio,interests')
        .eq('id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile row yet — leave fields empty
          return;
        }
        console.log('Profile fetch error:', error.message);
        return;
      }

      if (data) {
        setName(data.name ?? '');
        setBio(data.bio ?? '');
        setInterests(data.interests?.join(', ') ?? '');
      }
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const interestsArray = interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          interests: interestsArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Save Failed', error.message);
      } else {
        Alert.alert('Success', 'Your profile has been updated.');
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'An unexpected error occurred.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Please log in to view your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>PROFILE</Text>
          <Text style={styles.subtitle}>Edit your profile details</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />

          <Text style={styles.label}>Interests</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Books, Coffee, Tennis"
            placeholderTextColor="#555"
            value={interests}
            onChangeText={setInterests}
          />
          <Text style={styles.hint}>Separate interests with commas</Text>

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#111111',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    marginTop: -4,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
