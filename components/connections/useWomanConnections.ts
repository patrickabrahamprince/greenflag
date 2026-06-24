'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { mapStatus } from './types';
import type {
  ConnectionRow,
  ProfileRow,
  SubmissionRow,
  StandardRow,
  ConnectionStatus,
} from './types';

export interface EnrichedConnection {
  id: string;
  manName: string;
  manPhoto: string | null;
  currentDay: number;
  status: ConnectionStatus;
  deadline: string | null;
  sortKey: number;
}

interface UseWomanConnectionsResult {
  connections: EnrichedConnection[];
  standard: StandardRow | null;
  intentionCount: number;
  loading: boolean;
}

const STATUS_ORDER: Record<ConnectionStatus, number> = {
  pending_review: 0,
  active: 1,
  pending_submission: 2,
  connected: 3,
  ended: 4,
};

export function useWomanConnections(): UseWomanConnectionsResult {
  const router = useRouter();
  const supabase = createClient();
  const [connections, setConnections] = useState<EnrichedConnection[]>([]);
  const [standard, setStandard] = useState<StandardRow | null>(null);
  const [intentionCount, setIntentionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: std } = await supabase
        .from('standards')
        .select('*')
        .eq('woman_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (std) {
        setStandard(std as StandardRow);
        const { count } = await supabase
          .from('intentions')
          .select('*', { count: 'exact', head: true })
          .eq('standard_id', std.id);
        setIntentionCount(count ?? 0);
      }

      const { data: conns } = await supabase
        .from('connections')
        .select(
          'id, status, tasks_completed, current_day, host_id, guest_id, created_at',
        )
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (!conns || conns.length === 0) {
        setLoading(false);
        return;
      }

      const guestIds = Array.from(new Set((conns as ConnectionRow[]).map((c) => c.guest_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photos')
        .in('id', guestIds);

      const profileMap = new Map<string, ProfileRow>();
      (profiles as ProfileRow[] | null)?.forEach((p) => profileMap.set(p.id, p));

      const connIds = (conns as ConnectionRow[]).map((c) => c.id);
      const { data: subs } = await supabase
        .from('submissions')
        .select('connection_id, approved, deadline')
        .in('connection_id', connIds)
        .eq('approved', false)
        .order('submitted_at', { ascending: false });

      const latestReviewSub = new Map<string, SubmissionRow>();
      (subs as SubmissionRow[] | null)?.forEach((s) => {
        if (!latestReviewSub.has(s.connection_id)) {
          latestReviewSub.set(s.connection_id, s);
        }
      });

      const enriched: EnrichedConnection[] = (conns as ConnectionRow[]).map((c) => {
        const profile = profileMap.get(c.guest_id);
        const hasPendingReview = latestReviewSub.has(c.id);
        const status = mapStatus(c.status, hasPendingReview);
        const deadline = latestReviewSub.get(c.id)?.deadline ?? null;

        return {
          id: c.id,
          manName: profile?.name ?? 'Unknown',
          manPhoto: profile?.photos?.[0] ?? null,
          currentDay: c.current_day,
          status,
          deadline,
          sortKey: STATUS_ORDER[status],
        };
      });

      enriched.sort((a, b) => a.sortKey - b.sortKey);
      setConnections(enriched);
      setLoading(false);
    };

    load();
  }, [supabase, router]);

  return { connections, standard, intentionCount, loading };
}
