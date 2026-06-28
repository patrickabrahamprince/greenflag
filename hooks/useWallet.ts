// /hooks/useWallet.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient();

  const fetchBalance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet exists yet, create one with 0 balance
          const { data: newWallet } = await supabase
            .from('wallets')
            .insert({ user_id: user.id, balance: 0 })
            .select('balance')
            .single();
          if (newWallet) setBalance(newWallet.balance);
        } else {
          console.error('Error fetching balance:', error);
        }
      } else if (data) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const deductCoins = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('deduct_coins', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
      });

      if (error) {
        console.error('RPC Error deduct_coins:', error);
        return false;
      }

      if (data === true) {
        await fetchBalance();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error deducting coins:', err);
      return false;
    }
  }, [supabase, fetchBalance]);

  return { balance, deductCoins, loading, refreshBalance: fetchBalance };
}
