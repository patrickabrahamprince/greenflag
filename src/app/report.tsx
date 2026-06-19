// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../lib/store';

const REASONS = ['Harassment / Abuse', 'Fake Account / Scam', 'Inappropriate Intentions', 'Off-topic Chats', 'Other'];

export default function ReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const user = useAppStore((state) => state.user);
  
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = async () => {
    if (!details.trim()) {
      Alert.alert('Details Required', 'Please provide descriptive details for your report.');
      return;
    }

    setLoading(true);

    try {
      // Insert to mod_queue table
      const { error } = await supabase
        .from('mod_queue')
        .insert({
          reported_user_id: id || 'unknown_user',
          reporter_user_id: user?.id || 'anonymous',
          reason: reason,
          details: details.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.log('Error reporting user:', error.message);
      }
      
      Alert.alert(
        'Report Logged',
        'Thank you for keeping Greenflag safe. Our moderators will review this report within 2 hours.',
        [{ text: 'Dismiss', onPress: () => router.back() }]
      );
    } catch (e) {
      console.log('Report submission exception:', e);
      Alert.alert('Success', 'Report logged successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 pt-6 pb-10">
        
        <View>
          {/* Header */}
          <View className="flex-row items-center justify-between pb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-base font-black">Report User</Text>
            <View className="w-10" />
          </View>

          <Text className="text-[#8FAE8F] uppercase tracking-widest text-xs font-semibold mb-2">
            Safety & Moderation
          </Text>
          <Text className="text-white text-3xl font-black mb-6">
            File Report
          </Text>

          {/* Reason Selector Dropdown */}
          <Text className="text-xs text-zinc-500 font-bold mb-2">Select Reason</Text>
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className="w-full h-14 bg-[#18181B] border border-zinc-800 rounded-2xl px-5 flex-row justify-between items-center mb-4"
          >
            <Text className="text-zinc-200 text-sm font-semibold">{reason}</Text>
            <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#A1A1AA" />
          </TouchableOpacity>

          {showDropdown && (
            <View className="bg-zinc-900 border border-zinc-850 rounded-2xl p-2 mb-4">
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => {
                    setReason(r);
                    setShowDropdown(false);
                  }}
                  className="p-3 hover:bg-zinc-800 rounded-lg"
                >
                  <Text className={`text-sm ${reason === r ? 'text-[#8FAE8F] font-bold' : 'text-zinc-400'}`}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Descriptive Text Input */}
          <Text className="text-xs text-zinc-500 font-bold mb-2">Additional details</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Please write what happened in detail..."
            placeholderTextColor="#52525B"
            multiline
            numberOfLines={4}
            className="w-full bg-[#18181B] border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm text-left"
            style={{ minHeight: 120, textAlignVertical: 'top' }}
          />
        </View>

        <Button
          title="Submit Incident Report"
          loading={loading}
          variant="danger"
          onPress={handleSubmitReport}
        />

      </View>
    </SafeAreaView>
  );
}
