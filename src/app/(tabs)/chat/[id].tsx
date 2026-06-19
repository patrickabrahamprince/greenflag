// @ts-nocheck
import React, { useState, useRef } from 'react';
import { View, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Text';
import { useAppStore } from '../../../lib/store';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const connections = useAppStore((state) => state.connections);
  const user = useAppStore((state) => state.user);

  const connection = connections.find((c) => c.id === id) || connections[0];
  const partner = connection?.partner || { name: 'Chat Partner', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' };

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey there! How is your day going?', senderId: partner.id || 'partner_1', timestamp: '7:00 PM' },
    { id: '2', text: 'Hey! Doing good. Ready for our day check-in?', senderId: 'user_123', timestamp: '7:02 PM' },
    { id: '3', text: 'Absolutely. Lets meet our milestones.', senderId: partner.id || 'partner_1', timestamp: '7:05 PM' },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: String(messages.length + 1),
      text: inputText.trim(),
      senderId: user?.id || 'user_123',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Image source={{ uri: partner.avatar }} className="w-10 h-10 rounded-full mr-3" />
            <View>
              <Text className="text-base font-bold text-white">{partner.name}</Text>
              <Text className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">No Read Receipts</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => router.push(`/report?id=${partner.id || 'partner_1'}`)} className="p-1">
            <Ionicons name="shield-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === (user?.id || 'user_123');
            return (
              <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#1A4D1A] rounded-tr-none'
                      : 'bg-zinc-900 rounded-tl-none border border-zinc-800'
                  }`}
                >
                  <Text className="text-sm font-medium text-white leading-relaxed">{item.text}</Text>
                  <Text className="text-[9px] text-zinc-500 text-right mt-1 font-semibold">{item.timestamp}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Text Input Area Only */}
        <View className="p-4 border-t border-zinc-900 bg-black flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#52525B"
            className="flex-1 h-12 bg-zinc-900 border border-zinc-800 rounded-full px-5 text-white text-sm"
          />
          <TouchableOpacity
            onPress={handleSend}
            className="w-12 h-12 bg-[#1A4D1A] rounded-full items-center justify-center ml-3"
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
