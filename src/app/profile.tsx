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
import Checkbox from 'expo-checkbox';
import { supabase, getCurrentUserId } from '../lib/supabase';

const CHIP_OPTIONS = [
  'Books', 'Coffee', 'Tennis', 'Startups', 'Art',
  'Hiking', 'Wine', 'Poetry', 'Techno', 'Dogs'
];

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [persona, setPersona] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [isOver18, setIsOver18] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        Alert.alert('Session Error', 'Please log in again.');
        router.replace('/');
        return;
      }
      setUserId(uid);

      // Fetch existing user to get persona and potentially prefill profile if returning
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'User record not found. Redirecting to start.');
        router.replace('/');
        return;
      }
      
      setPersona(data.persona);
      if (data.name) setName(data.name);
      if (data.age) setAge(data.age.toString());
      if (data.city) setCity(data.city);
      if (data.bio) setBio(data.bio);
      if (data.interests) setInterests(data.interests);
      if (data.looking_for) setLookingFor(data.looking_for);
      if (data.is_over_18 !== undefined) setIsOver18(data.is_over_18);
      if (data.agreed_terms !== undefined) setAgreedTerms(data.agreed_terms);

    } catch (e) {
      console.log('Error loading user data:', e);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      if (interests.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 interests.');
        return;
      }
      setInterests([...interests, interest]);
    }
  };

  const toggleLookingFor = (interest: string) => {
    if (lookingFor.includes(interest)) {
      setLookingFor(lookingFor.filter((i) => i !== interest));
    } else {
      if (lookingFor.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 interests.');
        return;
      }
      setLookingFor([...lookingFor, interest]);
    }
  };

  const handleSave = async () => {
    // Validations
    if (!name.trim() || !age.trim() || !city.trim() || !bio.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all text fields.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('Invalid Age', 'Please enter a valid age.');
      return;
    }

    if (interests.length === 0) {
      Alert.alert('Selection Required', 'Please select at least 1 interest.');
      return;
    }

    if (lookingFor.length === 0) {
      Alert.alert('Selection Required', 'Please select at least 1 option for Looking For.');
      return;
    }

    if (!isOver18) {
      Alert.alert('Age Verification', 'You must verify that you are 18+ years old.');
      return;
    }

    if (!agreedTerms) {
      Alert.alert('Terms of Service', 'You must agree to the Terms and Conditions.');
      return;
    }

    setLoading(true);
    try {
      // Save all to users table
      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          age: ageNum,
          city: city.trim(),
          bio: bio.trim(),
          interests,
          looking_for: lookingFor,
          is_over_18: isOver18,
          agreed_terms: agreedTerms,
        })
        .eq('id', userId);

      if (error) {
        Alert.alert('Save Failed', error.message || 'Error occurred while saving profile.');
        setLoading(false);
        return;
      }

      // If woman push /standard, if man push /(tabs)/discover
      if (persona === 'woman') {
        router.push('/standard');
      } else {
        router.push('/(tabs)/discover');
      }
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
          <Text style={styles.title}>CREATE YOUR PROFILE</Text>
          <Text style={styles.subtitle}>Introduce yourself to the Greenflag community</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sarah Jenkins"
              placeholderTextColor="#555"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 24"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={[styles.section, { flex: 2 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. New York"
                  placeholderTextColor="#555"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

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
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Interests (Select up to 5)</Text>
            <View style={styles.chipsContainer}>
              {CHIP_OPTIONS.map((item) => {
                const selected = interests.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, selected && styles.selectedChip]}
                    onPress={() => toggleInterest(item)}
                  >
                    <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Looking For Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Looking For (Select up to 5)</Text>
            <View style={styles.chipsContainer}>
              {CHIP_OPTIONS.map((item) => {
                const selected = lookingFor.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, selected && styles.selectedChip]}
                    onPress={() => toggleLookingFor(item)}
                  >
                    <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Checkboxes */}
          <View style={styles.checkboxContainer}>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={isOver18}
                onValueChange={setIsOver18}
                color={isOver18 ? '#D4AF37' : '#555'}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxLabel}>I am 18 years of age or older</Text>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                value={agreedTerms}
                onValueChange={setAgreedTerms}
                color={agreedTerms ? '#D4AF37' : '#555'}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxLabel}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
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
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedChip: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  chipText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginVertical: 15,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
