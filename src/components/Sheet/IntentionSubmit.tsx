// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

interface IntentionSubmitProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (intention: string) => void;
}

export const IntentionSubmit: React.FC<IntentionSubmitProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/80">
        <View className="bg-[#18181B] border-t border-zinc-800 rounded-t-3xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-black">Declare Your Intention</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-zinc-400 mb-4 leading-relaxed">
            Write down your standard intention for this connection. Be genuine. This is locked forever once submitted and will be reviewed.
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="E.g., I am looking for a consistent coffee partner leading to a long-term relationship..."
            placeholderTextColor="#52525B"
            multiline
            numberOfLines={4}
            className="w-full bg-[#000000] border border-zinc-800 rounded-2xl p-4 text-zinc-100 text-base mb-6 text-left"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Button
            title="Submit Intention"
            disabled={!text.trim()}
            onPress={() => {
              onSubmit(text);
              setText('');
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default IntentionSubmit;
