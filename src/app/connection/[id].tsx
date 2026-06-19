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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, getCurrentUserId } from '../../lib/supabase';

interface IntentionItem {
  day: number;
  prompt: string;
}

interface ConnectionData {
  id: string;
  initiator_id: string;
  recipient_id: string;
  standard_id: string;
  state: string;
  approved_count: number;
  day_count: number;
  expires_at: string;
  chat_unlocked_at?: string | null;
}

interface UserProfile {
  id: string;
  name: string;
  persona: string;
}

interface SubmissionData {
  id: string;
  connection_id: string;
  user_id: string;
  day: number;
  text: string;
  status: string;
}

export default function ConnectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  // Loaded database values
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [intentions, setIntentions] = useState<IntentionItem[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  
  // Submission for the CURRENT active day
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionData | null>(null);

  // Form input response
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadScreenData();
  }, [id]);

  const loadScreenData = async () => {
    setLoading(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        Alert.alert('Session Error', 'Please log in again.');
        router.replace('/');
        return;
      }
      setMyId(uid);

      // 1. Fetch connection details
      const { data: conn, error: connErr } = await supabase
        .from('connections')
        .select('*')
        .eq('id', id)
        .single();

      if (connErr || !conn) {
        Alert.alert('Error', 'Connection not found.');
        router.back();
        return;
      }
      setConnection(conn);

      // 2. Fetch standards (intentions)
      const { data: standard, error: stdErr } = await supabase
        .from('standards')
        .select('*')
        .eq('id', conn.standard_id)
        .single();

      if (stdErr || !standard) {
        console.log('Error standard:', stdErr);
      } else {
        setIntentions(standard.intentions || []);
      }

      // 3. Fetch other user's profile
      const otherId = conn.initiator_id === uid ? conn.recipient_id : conn.initiator_id;
      const { data: profile } = await supabase
        .from('users')
        .select('id, name, persona')
        .eq('id', otherId)
        .single();

      if (profile) {
        setOtherUser(profile);
      }

      // 4. Fetch submission for current active day
      const { data: subs } = await supabase
        .from('submissions')
        .select('*')
        .eq('connection_id', id)
        .eq('day', conn.day_count)
        .order('id', { ascending: false });

      if (subs && subs.length > 0) {
        setCurrentSubmission(subs[0]);
      } else {
        setCurrentSubmission(null);
      }

    } catch (e) {
      console.log('Error loading connection detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!responseText.trim()) {
      Alert.alert('Input Needed', 'Please type a response.');
      return;
    }
    if (!myId || !connection) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          connection_id: id,
          user_id: myId,
          day: connection.day_count,
          text: responseText.trim(),
          status: 'pending',
        });

      if (error) {
        Alert.alert('Database Error', 'Could not submit answer.');
      } else {
        setResponseText('');
        Alert.alert('Response Submitted', 'Your response is pending review.');
        await loadScreenData(); // Reload
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!connection || !currentSubmission) return;

    setActionLoading(true);
    try {
      // 1. Update submissions status = approved
      const { error: subErr } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', currentSubmission.id);

      if (subErr) {
        Alert.alert('Error', 'Failed to approve submission.');
        setActionLoading(false);
        return;
      }

      // 2. Calculate next counters
      const nextApprovedCount = connection.approved_count + 1;
      const nextDayCount = connection.day_count + 1;
      let chatUnlockedAt = connection.chat_unlocked_at;
      let newState = connection.state;

      // 3. Day 3 logic: Add 20 coins to recipient, insert transaction, unlock chat
      if (nextApprovedCount === 3 && !chatUnlockedAt) {
        chatUnlockedAt = new Date().toISOString();

        // Query her coins (recipient)
        const { data: recipientUser } = await supabase
          .from('users')
          .select('coins')
          .eq('id', connection.recipient_id)
          .single();

        const currentRecipientCoins = recipientUser?.coins ?? 500;
        const newRecipientCoins = currentRecipientCoins + 20;

        // Update recipient coins
        await supabase
          .from('users')
          .update({ coins: newRecipientCoins })
          .eq('id', connection.recipient_id);

        // Insert transaction log
        await supabase
          .from('transactions')
          .insert({
            user_id: connection.recipient_id,
            type: 'earn_day3',
            amount: 20,
          });
      }

      // 4. Day 8 logic: Connect state
      if (nextApprovedCount === 8) {
        newState = 'connected';
      }

      // 5. Save changes to connections table
      const { error: connErr } = await supabase
        .from('connections')
        .update({
          approved_count: nextApprovedCount,
          day_count: nextDayCount,
          chat_unlocked_at: chatUnlockedAt,
          state: newState,
        })
        .eq('id', id);

      if (connErr) {
        Alert.alert('Error', 'Failed to update connection state.');
      } else {
        Alert.alert('Response Approved', 'Progression updated successfully!');
        await loadScreenData();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentSubmission) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', currentSubmission.id);

      if (error) {
        Alert.alert('Error', 'Could not reject submission.');
      } else {
        Alert.alert('Rejected', 'Response has been rejected. He will need to try again.');
        await loadScreenData();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChatPress = () => {
    Alert.alert('Chat Unlocked', "You are officially connected! Standard Chat is now open.");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading progression...</Text>
      </View>
    );
  }

  if (!connection) return null;

  const isInitiator = myId === connection.initiator_id; // Man
  const isRecipient = myId === connection.recipient_id; // Woman

  // Get current day's prompt
  const activePrompt = intentions.find((i) => i.day === connection.day_count)?.prompt || 'No prompt available for today.';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header summary info */}
        <View style={styles.summaryCard}>
          <Text style={styles.withText}>Connecting with</Text>
          <Text style={styles.nameText}>{otherUser?.name || 'Anonymous'}</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Day {connection.day_count} / 8</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{connection.approved_count} Approved</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(connection.approved_count / 8) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Prompt Card */}
        <View style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <Ionicons name="bookmark" size={18} color="#D4AF37" style={{ marginRight: 6 }} />
            <Text style={styles.promptHeaderTitle}>TODAY'S PROMPT (DAY {connection.day_count})</Text>
          </View>
          <Text style={styles.promptText}>{activePrompt}</Text>
        </View>

        {/* Interaction Panel */}
        <View style={styles.interactionPanel}>
          {isInitiator && (
            <>
              {/* Man viewing prompt and sending responses */}
              {!currentSubmission || currentSubmission.status === 'rejected' ? (
                <View style={styles.actionBox}>
                  {currentSubmission?.status === 'rejected' && (
                    <View style={styles.rejectedBanner}>
                      <Ionicons name="close-circle" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                      <Text style={styles.rejectedText}>Your previous answer was rejected. Please try again.</Text>
                    </View>
                  )}
                  <Text style={styles.instructionLabel}>Your Response</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Write your thoughtful answer here..."
                    placeholderTextColor="#555"
                    multiline
                    numberOfLines={4}
                    value={responseText}
                    onChangeText={setResponseText}
                  />
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleResponseSubmit}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.submitBtnText}>Submit Response</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusBox}>
                  <Text style={styles.statusBoxLabel}>Your Submitted Response:</Text>
                  <Text style={styles.statusBoxText}>"{currentSubmission.text}"</Text>
                  
                  {currentSubmission.status === 'pending' ? (
                    <View style={styles.pendingBadge}>
                      <Ionicons name="time" size={16} color="#D4AF37" style={{ marginRight: 6 }} />
                      <Text style={styles.pendingBadgeText}>Awaiting Review</Text>
                    </View>
                  ) : (
                    <View style={styles.approvedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CD964" style={{ marginRight: 6 }} />
                      <Text style={styles.approvedBadgeText}>Approved</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {isRecipient && (
            <>
              {/* Woman viewing response and approving/rejecting */}
              {!currentSubmission ? (
                <View style={styles.statusBox}>
                  <Ionicons name="hourglass-outline" size={32} color="#D4AF37" style={{ alignSelf: 'center', marginBottom: 10 }} />
                  <Text style={styles.awaitingText}>Awaiting his answer to Day {connection.day_count} prompt.</Text>
                </View>
              ) : currentSubmission.status === 'pending' ? (
                <View style={styles.actionBox}>
                  <Text style={styles.answerHeader}>His Answer:</Text>
                  <View style={styles.answerTextCard}>
                    <Text style={styles.answerText}>"{currentSubmission.text}"</Text>
                  </View>

                  <View style={styles.decideButtonsRow}>
                    <TouchableOpacity
                      style={[styles.decideBtn, styles.rejectBtn]}
                      onPress={handleReject}
                      disabled={actionLoading}
                    >
                      <Ionicons name="close-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.decideBtnText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.decideBtn, styles.approveBtn]}
                      onPress={handleApprove}
                      disabled={actionLoading}
                    >
                      <Ionicons name="checkmark-outline" size={20} color="#000" style={{ marginRight: 6 }} />
                      <Text style={[styles.decideBtnText, { color: '#000' }]}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.statusBox}>
                  <Text style={styles.answerHeader}>His Answer (Reviewed):</Text>
                  <View style={styles.answerTextCard}>
                    <Text style={styles.answerText}>"{currentSubmission.text}"</Text>
                  </View>
                  <View style={currentSubmission.status === 'approved' ? styles.approvedBadge : styles.rejectedBadge}>
                    <Ionicons
                      name={currentSubmission.status === 'approved' ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={currentSubmission.status === 'approved' ? "#4CD964" : "#FF3B30"}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={currentSubmission.status === 'approved' ? styles.approvedBadgeText : styles.rejectedBadgeText}>
                      {currentSubmission.status === 'approved' ? 'Approved' : 'Rejected'}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Chat unlock status */}
        {connection.chat_unlocked_at && (
          <TouchableOpacity style={styles.chatUnlockedBtn} onPress={handleChatPress}>
            <Ionicons name="chatbubbles" size={20} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.chatUnlockedText}>Chat Unlocked - Say Hello!</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: 12,
    fontSize: 16,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 20,
    alignItems: 'center',
  },
  withText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  promptCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 8,
    marginBottom: 10,
  },
  promptHeaderTitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  promptText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  interactionPanel: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
  },
  actionBox: {
    width: '100%',
  },
  instructionLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#000',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBox: {
    width: '100%',
    paddingVertical: 10,
  },
  statusBoxLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  statusBoxText: {
    color: '#FFF',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 16,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  pendingBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#4CD964',
  },
  approvedBadgeText: {
    color: '#4CD964',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#FF3B30',
  },
  rejectedBadgeText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#FF3B30',
  },
  rejectedText: {
    color: '#FF3B30',
    fontSize: 12,
    flex: 1,
  },
  awaitingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  answerHeader: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerTextCard: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#222',
    marginBottom: 16,
  },
  answerText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  decideButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  decideBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: '#FF3B30',
  },
  approveBtn: {
    backgroundColor: '#D4AF37',
  },
  decideBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatUnlockedBtn: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  chatUnlockedText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
