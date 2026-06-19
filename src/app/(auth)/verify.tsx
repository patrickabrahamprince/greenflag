// @ts-nocheck
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join('');
  const isVerified = fullCode.length === 6;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#1A4D1A']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} className="flex-1 p-6">
        <View className="flex-1 pt-20">
          <Text className="text-white text-3xl font-bold mb-2">Check your phone</Text>
          <Text className="text-green-400 mb-10">We sent a code to your number</Text>

          <View className="flex-row justify-between mb-10">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="bg-green-800 border border-green-600/30 rounded-2xl w-14 h-16 text-center text-white text-2xl font-bold"
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/permissions')}
            disabled={!isVerified}
            className="rounded-3xl overflow-hidden"
          >
            <LinearGradient
              colors={isVerified ? ['#2D5F2D', '#D4AF37'] : ['#1A4D1A', '#1A4D1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-5 items-center"
            >
              <Text className={`font-bold text-lg ${isVerified ? 'text-black' : 'text-green-400'}`}>
                Verify
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={timer > 0} className="items-center py-4">
          <Text className="text-green-400 text-center">
            {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}
