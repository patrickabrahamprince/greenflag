// @ts-nocheck
import { useRouter } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SECTIONS = [
  {
    title: 'Account',
    rows: [
      { label: 'Edit Profile', route: '/settings/edit-profile', icon: 'person-outline' },
      { label: 'Preferences', route: '/settings/preferences', icon: 'options-outline' },
    ],
  },
  {
    title: 'App',
    rows: [
      { label: 'Notifications', icon: 'notifications-outline' },
      { label: 'Privacy', icon: 'lock-closed-outline' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { label: 'Help', icon: 'help-circle-outline' },
      { label: 'Terms', icon: 'document-text-outline' },
    ],
  },
  {
    title: 'About',
    rows: [
      { label: 'Version', value: '1.0.0', icon: 'information-circle-outline' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#0D3D0D', '#000']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-1">
        <View className="px-6 pt-12 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mt-4">Settings</Text>
        </View>
        <ScrollView className="flex-1 px-6">
          {SECTIONS.map((section, si) => (
            <View key={si} className="bg-green-800 rounded-2xl p-6 mb-4 border border-green-600/10">
              {section.rows.map((row, ri) => (
                <TouchableOpacity
                  key={ri}
                  onPress={() => row.route ? router.push(row.route) : {}}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name={row.icon} size={20} color="#D4AF37" />
                    <Text className="text-white text-base ml-4">{row.label}</Text>
                  </View>
                  <View className="flex-row items-center">
                    {row.value && <Text className="text-green-400 text-sm mr-2">{row.value}</Text>}
                    <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <TouchableOpacity className="bg-red-500/80 rounded-2xl p-4 mb-12">
            <Text className="text-white font-bold text-center text-base">Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
