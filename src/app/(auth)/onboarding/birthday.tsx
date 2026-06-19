// @ts-nocheck
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
export default function BirthdayScreen() {
  const [day, setDay] = useState(''); const [month, setMonth] = useState(''); const [year, setYear] = useState(''); const router = useRouter();
  const filled = day.length === 2 && month.length === 2 && year.length === 4;
  return (
    <SafeAreaView className="flex-1 bg-black p-6">
      <View className="flex-1 pt-20">
        <Text className="text-white text-4xl font-bold mb-4">Your birthday</Text>
        <Text className="text-zinc-400 mb-8">This won't be shown publicly.</Text>
        <View className="flex-row gap-4">
          <TextInput value={day} onChangeText={setDay} placeholder="DD" placeholderTextColor="#52525b" keyboardType="number-pad" maxLength={2} className="bg-zinc-900 text-white text-2xl p-5 rounded-2xl flex-1 text-center" />
          <TextInput value={month} onChangeText={setMonth} placeholder="MM" placeholderTextColor="#52525b" keyboardType="number-pad" maxLength={2} className="bg-zinc-900 text-white text-2xl p-5 rounded-2xl flex-1 text-center" />
          <TextInput value={year} onChangeText={setYear} placeholder="YYYY" placeholderTextColor="#52525b" keyboardType="number-pad" maxLength={4} className="bg-zinc-900 text-white text-2xl p-5 rounded-2xl flex-[2] text-center" />
        </View>
      </View>
      <TouchableOpacity onPress={() => router.push('/onboarding/gender')} disabled={!filled} className={`p-4 rounded-full ${filled ? 'bg-green-500' : 'bg-zinc-800'}`}>
        <Text className={`text-center text-lg font-semibold ${filled ? 'text-black' : 'text-zinc-500'}`}>Continue</Text>
      </TouchableOpacity>
      {__DEV__ && <TouchableOpacity onPress={()=>router.replace('/(tabs)')} className="p-3 mb-4 bg-zinc-800 rounded-full"><Text className="text-white text-center">DEV: Skip Onboarding</Text></TouchableOpacity>}
    </SafeAreaView>
  );
}
