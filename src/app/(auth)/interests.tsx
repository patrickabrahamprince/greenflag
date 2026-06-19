// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

const INTERESTS_LIST = ['Design', 'Coffee', 'Music', 'Running', 'Tech', 'Art', 'Reading', 'Travel', 'Cooking', 'Yoga'];
const LOOKING_FOR_LIST = ['Long term', 'Consistent coffee dates', 'Meaningful chats', 'Shared values', 'Active lifestyle', 'Friendship first'];

export default function InterestsScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  
  const isSetStandard = user?.persona === 'standard'; // E.g., Women
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Women chips looking_for selection
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  
  // Men inputs
  const [textInput1, setTextInput1] = useState('');
  const [textInput2, setTextInput2] = useState('');
  const [textInput3, setTextInput3] = useState('');

  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((x) => x !== interest));
    } else {
      if (selectedInterests.length >= 5) return;
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleLookingFor = (lf: string) => {
    if (selectedLookingFor.includes(lf)) {
      setSelectedLookingFor(selectedLookingFor.filter((x) => x !== lf));
    } else {
      if (selectedLookingFor.length >= 5) return;
      setSelectedLookingFor([...selectedLookingFor, lf]);
    }
  };

  const handleFinish = async () => {
    // validations
    if (selectedInterests.length < 3) {
      Alert.alert('Selection Required', 'Please select at least 3 interests.');
      return;
    }

    if (isSetStandard && selectedLookingFor.length < 1) {
      Alert.alert('Selection Required', 'Please select at least 1 "looking for" standard.');
      return;
    }

    if (!isSetStandard && (!textInput1.trim() || !textInput2.trim())) {
      Alert.alert('Required Inputs', 'Please fill out at least the first two expectation text fields.');
      return;
    }

    setLoading(true);

    const lookingFor = isSetStandard 
      ? selectedLookingFor 
      : [textInput1.trim(), textInput2.trim(), textInput3.trim()].filter(Boolean);

    const updateData = { interests: selectedInterests, lookingFor };

    try {
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);
        
        if (error) console.log('Error saving interests:', error.message);
      }
      
      setUser(updateData);
      // Redirect to main tabs flow (standard list)
      router.replace('/(tabs)/standard');
    } catch (e) {
      console.log('Exception in interests onboarding:', e);
      setUser(updateData);
      router.replace('/(tabs)/standard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-12 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-zinc-500 font-semibold text-xs">Step 3 of 3</Text>
          <View className="w-10" />
        </View>

        <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
          Dating Criteria
        </Text>
        <Text className="text-white text-3xl font-black mb-6">
          Intentions & Interests
        </Text>

        {/* Interests Section */}
        <Text className="text-sm font-bold text-zinc-300 mb-2">Interests (Select 3-5)</Text>
        <Text className="text-xs text-zinc-500 mb-4">Choose your core hobbies or topics.</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {INTERESTS_LIST.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                className={`px-4 py-2.5 rounded-full border ${
                  isSelected
                    ? 'bg-[#1A4D1A] border-[#8FAE8F]'
                    : 'bg-[#18181B] border-zinc-800'
                }`}
              >
                <Text className={`text-sm ${isSelected ? 'text-white font-bold' : 'text-zinc-400'}`}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic section based on Persona */}
        {isSetStandard ? (
          // Standard / Women / Invite-code-setter flow
          <View className="mb-8">
            <Text className="text-sm font-bold text-zinc-300 mb-2">Standards (Select up to 5)</Text>
            <Text className="text-xs text-zinc-500 mb-4">What criteria should candidates rising to your standard show?</Text>
            <View className="flex-row flex-wrap gap-2">
              {LOOKING_FOR_LIST.map((lf) => {
                const isSelected = selectedLookingFor.includes(lf);
                return (
                  <TouchableOpacity
                    key={lf}
                    onPress={() => toggleLookingFor(lf)}
                    className={`px-4 py-2.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#1A4D1A] border-[#8FAE8F]'
                        : 'bg-[#18181B] border-zinc-800'
                    }`}
                  >
                    <Text className={`text-sm ${isSelected ? 'text-white font-bold' : 'text-zinc-400'}`}>
                      {lf}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          // Rise / Men flow
          <View className="mb-8 space-y-4 gap-4">
            <Text className="text-sm font-bold text-zinc-300 mb-1">Dating Intentions</Text>
            <Text className="text-xs text-zinc-500 mb-2">Describe what you rising to standards look like. Be clear.</Text>
            
            <View>
              <Text className="text-xs text-zinc-400 font-bold mb-2">1. What are your long-term goals?</Text>
              <TextInput
                value={textInput1}
                onChangeText={setTextInput1}
                placeholder="E.g., Building a stable, committed partnership."
                placeholderTextColor="#52525B"
                className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-sm"
              />
            </View>

            <View>
              <Text className="text-xs text-zinc-400 font-bold mb-2">2. What standards do you value most?</Text>
              <TextInput
                value={textInput2}
                onChangeText={setTextInput2}
                placeholder="E.g., Active listening, mutual support and trust."
                placeholderTextColor="#52525B"
                className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-sm"
              />
            </View>

            <View>
              <Text className="text-xs text-zinc-400 font-bold mb-2">3. Describe your ideal dynamic</Text>
              <TextInput
                value={textInput3}
                onChangeText={setTextInput3}
                placeholder="E.g., Equal sharing of responsibilities and quality time."
                placeholderTextColor="#52525B"
                className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 text-white text-sm"
              />
            </View>
          </View>
        )}

        <Button
          title="Finish Onboarding"
          loading={loading}
          onPress={handleFinish}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
