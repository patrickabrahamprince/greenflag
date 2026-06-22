'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ConnectionView } from '@/components/connection/ConnectionView';
import type { ConnectionWithHost, SubmissionRecord, IntentionRecord } from '@/components/connection/types';

interface PageProps {
  params: Promise<{ connectionId: string }>;
}

export default function ConnectionPage({ params }: PageProps) {
  const { connectionId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [connection, setConnection] = useState<ConnectionWithHost | null>(null);
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [intention, setIntention] = useState<IntentionRecord | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('connection_id', connectionId)
        .eq('day_number', connTyped.current_day)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let intData: IntentionRecord | null = null;
      if (connTyped.test_id) {
        const { data: int } = await supabase
          .from('intentions')
          .select('*')
          .eq('standard_id', connTyped.test_id)
          .eq('day_number', connTyped.current_day)
          .maybeSingle();
        intData = (int as IntentionRecord) ?? null;
      }

      setConnection(connTyped);
      setSubmission((sub as SubmissionRecord) ?? null);
      setIntention(intData);
      setLoading(false);
    };

    load();
  }, [connectionId, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <p className="text-[#8E8E93] text-sm font-thin">Connection not found</p>
      </div>
    );
  }

  return <ConnectionView connection={connection} submission={submission} intention={intention} />;
}
