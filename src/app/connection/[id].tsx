// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../lib/store';
import { calculateTimeRemaining } from '../../lib/utils/timer';
import { IntentionSubmit } from '../../components/Sheet/IntentionSubmit';
import { StreakFreeze } from '../../components/Sheet/StreakFreeze';

const DAILY_INTENTIONS = [
  'Be honest and responsive in chats within 2 hours.',
  'Agree on equal split expectations or date guidelines.',
  'Commit to a weekly coffee date night.',
  'Introduce each other to a close friend.',
  'Maintain clear lines of direct communication.',
  'Declare deal-breakers and relationship alignment.',
  'Confirm long-term relationship commitment.',
  'Final check-in: Complete exchange of contact info.'
];

export default function ConnectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const { user, coins, deductCoins, connections, unlockChatDay } = useStore();

  const connection = connections.find((c) => c.id === id) || connections[0];
  if (!connection) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-zinc-500 font-bold">Connection not found</Text>
      </SafeAreaView>
    );
  }

  // Check user.persona - support both 'man'/'woman' and 'rise'/'standard'
  const isMan = user?.persona === 'man' || user?.persona === 'rise';
  const isWoman = user?.persona === 'woman' || user?.persona === 'standard';
  
  const partner = connection.partner;
  const currentIntentionText = DAILY_INTENTIONS[connection.currentDay - 1] || DAILY_INTENTIONS[0];

  // Timers State
  const [timeLeft, setTimeLeft] = useState('--:--:--');
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false);
  const [freezeSheetVisible, setFreezeSheetVisible] = useState(false);
  const [intentionSubmitted, setIntentionSubmitted] = useState(false);
  const [mySubmission, setMySubmission] = useState('');
  const [checkinApproved, setCheckinApproved] = useState(false);
  const [checkinRejected, setCheckinRejected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(connection.expiresAt);
      if (remaining.totalSeconds <= 0) {
        clearInterval(interval);
        router.replace(`/connection/${id}/ended?reason=expired`);
      } else {
        setTimeLeft(`${remaining.hours}:${remaining.minutes}:${remaining.seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [connection.expiresAt]);

  const handleIntentionSubmit = (text: string) => {
    setSubmitSheetVisible(false);
    setMySubmission(text);
    setIntentionSubmitted(true);
    Alert.alert('Intention Submitted', 'Your daily standard declaration has been sent to the curator.');
  };

  const handleApprove = () => {
    setCheckinApproved(true);
    Alert.alert(
      'Check-in Approved',
      `You approved compliance for Day ${connection.currentDay}.`,
      [
        {
          text: 'Next',
          onPress: () => {
            if (connection.currentDay === 4) {
              unlockChatDay(connection.id, 5);
            }
            if (connection.currentDay >= 8) {
              router.replace('/connected');
            }
          }
        }
      ]
    );
  };

  const handleReject = () => {
    setCheckinRejected(true);
    Alert.alert(
      'Check-in Rejected',
      'The compatibility check-in has been rejected.',
      [
        {
          text: 'End Match',
          style: 'destructive',
          onPress: () => {
            router.replace(`/connection/${id}/ended?reason=rejected`);
          }
        }
      ]
    );
  };

  const handleFreezeStreak = () => {
    if (coins < 25) {
      Alert.alert('Top-up Required', 'You need 25 coins to buy a Streak Freeze.');
      return;
    }
    deductCoins(25);
    setFreezeSheetVisible(false);
    Alert.alert('Streak Frozen', 'Match expiration timer extended by 24 hours.');
  };

  // Gold progress bar metrics
  const approvedCount = connection.approved_count || 0;
  const progressPercentage = (approvedCount / 8) * 100;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-black">Day {connection.currentDay} of 8</Text>
          <TouchableOpacity onPress={() => setFreezeSheetVisible(true)} className="p-2">
            <Ionicons name="snow" size={22} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Live Timer Banner - Colors: #0D3D0D / #1A4D1A */}
        <View className="bg-[#0D3D0D]/60 border border-[#1A4D1A] rounded-2xl p-4 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Ionicons name="hourglass-outline" size={18} color="#8FAE8F" />
            <Text className="text-xs text-[#8FAE8F] font-bold ml-2">Streak Expiration</Text>
          </View>
          <Text className="text-sm font-mono text-white font-bold">{timeLeft}</Text>
        </View>

        {/* Partner Info Details */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image source={{ uri: partner.avatar }} className="w-24 h-24 rounded-full border-2 border-[#2D5F2D] mb-3" />
            <View className="absolute bottom-2 right-0 w-6 h-6 bg-[#1A4D1A] border border-[#2D5F2D] rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark" size={12} color="#D4AF37" />
            </View>
          </View>
          <Text className="text-xl font-black text-white">{partner.name}, {partner.age}</Text>
          <Text className="text-xs text-[#8FAE8F] font-semibold">{partner.city}</Text>
        </View>

        {/* Gold Progress Bar: approved_count / 8 */}
        <View className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-zinc-400 font-bold uppercase">Gold Progress</Text>
            <Text className="text-xs text-[#D4AF37] font-black">{approvedCount}/8 Approved</Text>
          </View>
          <View className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#D4AF37]"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-[10px] text-zinc-500 text-center mt-2">
            Milestones approved curating compliance to your standard
          </Text>
        </View>

        {/* Dynamic Intention Submission Box */}
        <View className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 mb-6">
          <Text className="text-xs text-[#8FAE8F] font-bold uppercase tracking-wider mb-2">Today's Standard Intention</Text>
          <Text className="text-zinc-200 text-sm font-bold leading-relaxed mb-6">
            "{currentIntentionText}"
          </Text>

          {isMan && (
            // Male / Candidate perspective: Submit Intention
            <View>
              {intentionSubmitted ? (
                <View className="bg-[#1A4D1A]/50 border border-[#2D5F2D] rounded-2xl p-4 items-center">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#8FAE8F" className="mb-1" />
                  <Text className="text-[#8FAE8F] text-xs font-bold text-center">Intention Submitted</Text>
                  <Text className="text-zinc-400 text-[10px] text-center mt-1">"{mySubmission}"</Text>
                </View>
              ) : (
                <Button
                  title="Submit Declaration"
                  variant="gold"
                  onPress={() => setSubmitSheetVisible(true)}
                />
              )}
            </View>
          )}

          {isWoman && (
            // Female / Curator perspective: Approve or Reject
            <View>
              <Text className="text-xs text-zinc-400 font-bold mb-2">Partner's Submission:</Text>
              <View className="bg-black/35 border border-zinc-800 rounded-xl p-3 mb-4">
                <Text className="text-zinc-300 text-xs italic">
                  {connection.currentSubmission ? `"${connection.currentSubmission}"` : 'No submission sent yet.'}
                </Text>
              </View>

              {checkinApproved ? (
                <View className="bg-[#1A4D1A] rounded-2xl p-4 flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={18} color="white" className="mr-2" />
                  <Text className="text-white text-sm font-bold ml-1">You Approved Today's Check-in</Text>
                </View>
              ) : checkinRejected ? (
                <View className="bg-red-950/40 border border-red-900/60 rounded-2xl p-4 flex-row items-center justify-center">
                  <Ionicons name="close-circle" size={18} color="#FF6B6B" className="mr-2" />
                  <Text className="text-red-400 text-sm font-bold ml-1">Check-in Rejected</Text>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleReject}
                    className="flex-1 h-12 bg-red-950/20 border border-red-900/40 rounded-xl items-center justify-center"
                  >
                    <Text className="text-red-400 font-bold text-xs">Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleApprove}
                    disabled={!connection.currentSubmission}
                    className={`flex-1 h-12 rounded-xl items-center justify-center ${
                      connection.currentSubmission ? 'bg-[#1A4D1A]' : 'bg-zinc-800 opacity-50'
                    }`}
                  >
                    <Text className="text-white font-bold text-xs">Approve Compliance</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Chat access link if Day 5+ */}
        {connection.currentDay >= 5 && (
          <TouchableOpacity
            onPress={() => router.push(`/chat/${id}`)}
            className="w-full h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="chatbubbles" size={20} color="#D4AF37" className="mr-2" />
            <Text className="text-zinc-200 text-sm font-bold ml-1">Open Private Chat</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Overlays Sheets */}
      <IntentionSubmit
        visible={submitSheetVisible}
        onClose={() => setSubmitSheetVisible(false)}
        onSubmit={handleIntentionSubmit}
      />

      <StreakFreeze
        visible={freezeSheetVisible}
        onClose={() => setFreezeSheetVisible(false)}
        onConfirm={handleFreezeStreak}
        userCoins={coins}
      />
    </SafeAreaView>
  );
}
