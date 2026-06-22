'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { mapStatus } from './types';
import type {
  ConnectionRow,
  ProfileRow,
  ConnectionStatus,
} from './types';

interface EnrichedManConnection {
  id: string;
  womanName: string;
  womanPhoto: string | null;
  currentDay: number;
  status: ConnectionStatus;
  sortKey: number;
}

interface UseManConnectionsResult {
  connections: EnrichedManConnection[];
  loading: boolean;
}

const STATUS_ORDER: Record<ConnectionStatus, number> = {
  active: 0,
  pending_submission: 1,
  pending_review: 1,
  connected: 2,
  ended: 3,
};

export function useManConnections(): UseManConnectionsResult {
  const router = useRouter();
  const supabase = createClient();
  const [connections, setConnections] = useState<EnrichedManConnection[]>([]);
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

      const { data: conns } = await supabase
        .from('connections')
        .select(
          'id, status, tasks_completed, current_day, host_id, guest_id, created_at',
        )
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false });

      if (!conns || conns.length === 0) {
        setLoading(false);
        return;
      }

      const hostIds = Array.from(new Set((conns as ConnectionRow[]).map((c) => c.host_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photos')
        .in('id', hostIds);

      const profileMap = new Map<string, ProfileRow>();
      (profiles as ProfileRow[] | null)?.forEach((p) => profileMap.set(p.id, p));

      const enriched: EnrichedManConnection[] = (conns as ConnectionRow[]).map((c) => {
        const profile = profileMap.get(c.host_id);
        const status = mapStatus(c.status, false);

        return {
          id: c.id,
          womanName: profile?.name ?? 'Unknown',
          womanPhoto: profile?.photos?.[0] ?? null,
          currentDay: c.current_day,
          status,
          sortKey: STATUS_ORDER[status],
        };
      });

      enriched.sort((a, b) => a.sortKey - b.sortKey);
      setConnections(enriched);
      setLoading(false);
    };

    load();
  }, [supabase, router]);

  return { connections, loading };
}
