'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ConnectionView } from '@/components/connection/ConnectionView';
import type { ConnectionWithHost, SubmissionRecord, IntentionRecord } from '@/components/connection/types';

export default function ConnectionPage({ params }: { params: { connectionId: string } }) {
  const { connectionId } = params;
  const router = useRouter();
  const supabase = createClient();
  const [connection, setConnection] = useState<ConnectionWithHost | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [intentions, setIntentions] = useState<IntentionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: conn } = await supabase
        .from('connections')
        .select('*, host:host_id(id, name, photos)')
        .eq('id', connectionId)
        .single();

      if (!conn || conn.guest_id !== user.id) {
        router.push('/connections');
        return;
      }

      const connTyped = conn as unknown as ConnectionWithHost;

      const { data: submissionsList } = await supabase
        .from('submissions')
        .select('*')
        .eq('connection_id', connectionId)
        .eq('day_number', connTyped.current_day ?? 1);

      const subs = (submissionsList ?? []) as SubmissionRecord[];

      let intentionsList: IntentionRecord[] = [];
      if (connTyped.standard_id) {
        const { data: intentionsRes } = await supabase
          .from('intentions')
          .select('*')
          .eq('standard_id', connTyped.standard_id)
          .eq('day_number', connTyped.current_day ?? 1)
          .order('task_number', { ascending: true });

        intentionsList = (intentionsRes ?? []) as IntentionRecord[];
      }

      setConnection(connTyped);
      setSubmissions(subs);
      setIntentions(intentionsList);
      setLoading(false);
    };

    load();
  }, [connectionId, supabase, router, refreshTrigger]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F7' }}>
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F7' }}>
        <p className="text-[#8E8E93] text-sm font-thin">Connection not found</p>
      </div>
    );
  }

  return (
    <ConnectionView
      connection={connection}
      submissions={submissions}
      intentions={intentions}
      onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
    />
  );
}
