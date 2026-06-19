// @ts-nocheck
import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function PersonaScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'woman' | 'man' | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useAppStore((state) => state.user);
  const setPersona = useAppStore((state) => state.setPersona);

  const handleSelect = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      // update user's persona in Supabase and lock it forever
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({ persona: selected })
          .eq('id', user.id);
        
        if (error) {
          console.log('Error updating persona:', error.message);
        }
      }
      
      setPersona(selected);
      router.push('/(auth)/profile');
    } catch (e) {
      console.log('Exception setting persona:', e);
      setPersona(selected);
      router.push('/(auth)/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-12 pb-10">
        
        {/* Progress header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-zinc-500 font-semibold text-xs">Step 1 of 3</Text>
          <View className="w-10" />
        </View>

        {/* Headline */}
        <View className="my-6">
          <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
            Declare Your Persona
          </Text>
          <Text className="text-white text-3xl font-black mb-3">
            Choose Who You Are
          </Text>
          <Text className="text-zinc-550 text-xs italic font-medium text-amber-500">
            ⚠️ Warning: This selection is locked forever after selection.
          </Text>
        </View>

        {/* Choice Cards */}
        <View className="flex-1 justify-center space-y-4 gap-4">
          
          {/* Card 1: Woman */}
          <TouchableOpacity
            onPress={() => setSelected('woman')}
            activeOpacity={0.85}
            className={`p-6 rounded-3xl border ${
              selected === 'woman'
                ? 'bg-[#1A4D1A] border-[#8FAE8F]'
                : 'bg-[#18181B] border-zinc-800'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center mr-3">
                <Ionicons name="rose-outline" size={20} color="#D4AF37" />
              </View>
              <Text className="text-xl font-bold">Woman</Text>
            </View>
            <Text className="text-zinc-400 text-xs leading-relaxed">
              I Set the Standard. I curate intention lists, build the 8-day framework, and verify compatibility daily.
            </Text>
          </TouchableOpacity>

          {/* Card 2: Man */}
          <TouchableOpacity
            onPress={() => setSelected('man')}
            activeOpacity={0.85}
            className={`p-6 rounded-3xl border ${
              selected === 'man'
                ? 'bg-[#1A4D1A] border-[#8FAE8F]'
                : 'bg-[#18181B] border-zinc-800'
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center mr-3">
                <Ionicons name="male-outline" size={20} color="#8FAE8F" />
              </View>
              <Text className="text-xl font-bold">Man</Text>
            </View>
            <Text className="text-zinc-400 text-xs leading-relaxed">
              I Rise to the Standard. I commit to standard intentions, pay coin buy-ins, and complete milestones to prove compatibility.
            </Text>
          </TouchableOpacity>

        </View>

        {/* Submit */}
        <Button
          title="Confirm Persona"
          loading={loading}
          disabled={!selected}
          onPress={handleSelect}
        />
      </View>
    </SafeAreaView>
  );
}

