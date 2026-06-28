// /hooks/useNotifications.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Notification } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const loadData = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      // Fetch first 20 notifications
      const { data: list, error: listErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20);

      if (listErr) throw listErr;

      // Fetch unread count
      const { count, error: countErr } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .is('read_at', null);

      if (countErr) throw countErr;

      setNotifications((list as Notification[]) || []);
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Determine current user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadData(user.id);
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [supabase, loadData]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [supabase]);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [supabase, userId]);

  const refresh = useCallback(() => {
    if (userId) loadData(userId);
  }, [userId, loadData]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    refresh,
  };
}
