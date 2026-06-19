// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export default function WalletScreen() {
  const router = useRouter();
  const coins = useAppStore((state) => state.coins);
  const user = useAppStore((state) => state.user);
  
  const [history, setHistory] = useState<Transaction[]>([
    { id: 'tx_1', amount: 120, type: 'credit', description: 'Razorpay UPI Topup', created_at: '2026-06-19T10:00:00Z' },
    { id: 'tx_2', amount: 100, type: 'debit', description: 'Begin Match Buy-In', created_at: '2026-06-19T10:05:00Z' },
    { id: 'tx_3', amount: 25, type: 'debit', description: 'Bought Streak Freeze', created_at: '2026-06-19T12:00:00Z' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWalletAndTransactions = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data: walletData } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txData) {
          setHistory(txData);
        }
      } catch (e) {
        console.log('Error fetching wallet transactions:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndTransactions();
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-black">My Wallet</Text>
          <View className="w-10" />
        </View>

        {/* Current Balance Display */}
        <View className="bg-[#18181B] border border-zinc-800 rounded-3xl p-6 items-center shadow-xl mb-6 mt-2">
          <Text className="text-xs text-zinc-500 uppercase font-black mb-1">Total Available Balance</Text>
          <View className="flex-row items-baseline mb-4">
            <Ionicons name="sparkles" size={24} color="#D4AF37" className="mr-1" />
            <Text className="text-5xl font-black text-[#D4AF37] ml-1">{coins}</Text>
            <Text className="text-lg font-bold text-zinc-400 ml-1"> Coins</Text>
          </View>
          
          <Button
            title="Buy Coin Packs"
            variant="gold"
            onPress={() => router.push('/buy-coins')}
          />
        </View>

        {/* Transaction History */}
        <Text className="text-sm font-bold text-zinc-300 mb-4">Transaction History</Text>
        
        {history.length === 0 ? (
          <View className="py-12 items-center bg-zinc-950 rounded-3xl border border-zinc-900">
            <Ionicons name="receipt-outline" size={32} color="#52525B" className="mb-2" />
            <Text className="text-zinc-650 text-xs font-semibold">No recent transactions</Text>
          </View>
        ) : (
          <View className="space-y-3 gap-3">
            {history.map((tx) => {
              const isCredit = tx.type === 'credit';
              const date = new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
              return (
                <View
                  key={tx.id}
                  className="p-4 bg-[#18181B]/60 border border-zinc-900 rounded-2xl flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-zinc-200">{tx.description}</Text>
                    <Text className="text-[10px] text-zinc-500 mt-1 font-semibold">{date}</Text>
                  </View>
                  
                  <Text className={`text-base font-black ${isCredit ? 'text-green-500' : 'text-red-400'}`}>
                    {isCredit ? '+' : '-'}{tx.amount}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
