// @ts-nocheck
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Image, FlatList, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_MATCHES, MOCK_MESSAGES } from '@/constants/data';

const BUBBLE_MINE = ['#2D5F2D', '#4A7A4A'];
const BUBBLE_THEIRS = ['#1A4D1A', '#1A4D1A'];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const match = MOCK_MATCHES.find(m => m.id === id) || MOCK_MATCHES[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: input, sender: 'me', time: 'Now' }]);
    setInput('');
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === 'me';
    const colors = isMine ? BUBBLE_MINE : BUBBLE_THEIRS;
    return (
      <Animated.View className={`mb-3 ${isMine ? 'items-end' : 'items-start'}`} style={{ opacity: fadeAnim }}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className={`p-4 max-w-[75%] ${isMine ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none'}`}>
          <Text className="text-white text-base">{item.text}</Text>
        </LinearGradient>
        <Text className="text-green-400 text-xs mt-1">{item.time}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-row items-center px-6 py-4 pt-12 border-b border-green-600/20">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Image source={{ uri: match.avatar }} className="w-10 h-10 rounded-full mr-3" />
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{match.name}</Text>
          </View>
          <View className="w-2.5 h-2.5 rounded-full bg-gold" />
        </View>

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerClassName="p-6"
          renderItem={renderMessage}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-green-400 text-lg">Say hi! <Text className="text-gold">👋</Text></Text>
            </View>
          }
        />

        <View className="flex-row items-center px-6 py-4 pb-10 bg-green-800/80 border-t border-green-600/20" style={{ backgroundColor: 'rgba(26, 77, 26, 0.8)' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor="#8FAE8F"
            className="flex-1 bg-green-900 rounded-2xl px-5 py-4 mr-3 text-white text-base"
          />
          <TouchableOpacity onPress={sendMessage} disabled={!input.trim()} className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: input.trim() ? '#D4AF37' : '#2D5F2D' }}>
            <Ionicons name="send" size={20} color={input.trim() ? '#000' : '#8FAE8F'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
