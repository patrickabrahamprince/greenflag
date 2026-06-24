'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Standard } from '@/types';
import type { MappedConnection, RawConnection } from '@/components/admin/types';
import { ApplicantCard } from '@/components/admin/ApplicantCard';
import { ActiveConnectionCard } from '@/components/admin/ActiveConnectionCard';
import { HostStatsBar } from '@/components/admin/HostStatsBar';
import { HostActionButtons } from '@/components/admin/HostActionButtons';
import { EmptyConnectionsState } from '@/components/admin/EmptyConnectionsState';

export default function AdminHostDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const hostId = params.hostId as string;
  const [standard, setStandard] = useState<Standard | null>(null);
  const [connections, setConnections] = useState<MappedConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data: stdData } = await supabase
        .from('standards')
        .select('*')
        .eq('woman_id', hostId)
        .single();

      if (stdData) setStandard(stdData);

      const { data: connData } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          current_day,
          expires_at,
          created_at,
          guest:profiles!connections_guest_id_fkey(name, age, city)
        `)
        .eq('host_id', hostId);

      if (connData) {
        setConnections(connData.map((c: RawConnection) => ({
          ...c,
          guest_name: c.guest?.name,
          guest_age: c.guest?.age,
          guest_city: c.guest?.city,
        })));
      }

      setLoading(false);
    };

    fetchData();
  }, [hostId]);

  const applicants = connections.filter((c) => c.status === 'pending');
  const inProgress = connections.filter((c) => c.status === 'active');
  const completed: MappedConnection[] = [];

  if (loading) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex flex-col items-center justify-center">
        <div className="empty-state-icon">
          <Plus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No Standard Yet</h2>
        <p className="text-muted text-sm max-w-xs mb-8">
          This woman hasn&apos;t set a standard yet
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/users')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display text-white">
            Woman Dashboard
          </h1>
          <p className="text-sm text-muted">ID: {hostId}</p>
        </div>
      </div>
      <div className="py-4">
        <h2 className="font-display text-3xl text-white font-semibold">
          Standard
        </h2>
      </div>
      <HostStatsBar
        applicants={applicants.length}
        inProgress={inProgress.length}
        completed={completed.length}
      />
      <HostActionButtons isActive={standard.is_active} />
      {applicants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
            Applicants ({applicants.length})
          </h2>
          <div className="space-y-3">
            {applicants.map((c) => (
              <ApplicantCard key={c.id} connection={c} />
            ))}
          </div>
          <button className="w-full btn-ghost mt-3 text-sm">
            View all applicants
          </button>
        </div>
      )}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
            Active Connections
          </h2>
          <div className="space-y-3">
            {inProgress.map((c) => (
              <ActiveConnectionCard key={c.id} connection={c} />
            ))}
          </div>
        </div>
      )}
      {inProgress.length === 0 && applicants.length === 0 && (
        <EmptyConnectionsState />
      )}
    </div>
  );
}
