'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Plus, Users, Edit3, Pause, ChevronRight } from 'lucide-react';
import type { Standard } from '@/types';

const MOCK_STANDARD: Standard = {
  id: '1',
  host_id: 'host1',
  name: 'The Gold Standard',
  difficulty: 'medium',
  is_active: true,
  created_at: '2026-06-01T00:00:00Z',
};

const MOCK_CONNECTIONS = [
  { id: 'c1', test_id: 't1', guest_name: 'Rahul', guest_age: 28, guest_city: 'Mumbai', status: 'active' as const, tasks_completed: 3, expires_at: '2026-07-01T00:00:00Z', created_at: '2026-06-10T00:00:00Z' },
  { id: 'c2', test_id: 't2', guest_name: 'Arjun', guest_age: 31, guest_city: 'Bangalore', status: 'active' as const, tasks_completed: 6, expires_at: '2026-07-05T00:00:00Z', created_at: '2026-06-12T00:00:00Z' },
  { id: 'c3', test_id: 't3', guest_name: 'Vivaan', guest_age: 26, guest_city: 'Pune', status: 'pending' as const, tasks_completed: 0, expires_at: '2026-07-10T00:00:00Z', created_at: '2026-06-15T00:00:00Z' },
];

function ApplicantCard({ connection }: { connection: any }) {
  return (
    <div className="card flex items-center gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0">
        <span className="text-sm font-medium text-white">{connection.guest_name?.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{connection.guest_name}</p>
        <p className="text-sm text-muted">{connection.guest_age} &middot; {connection.guest_city}</p>
      </div>
      <span className="text-xs text-gold">Pending</span>
      <ChevronRight className="w-5 h-5 text-muted" />
    </div>
  );
}

function ActiveConnectionCard({ connection }: { connection: any }) {
  const total = 8;
  const progress = connection.tasks_completed;
  const pct = Math.round((progress / total) * 100);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0">
          <span className="text-sm font-medium text-white">{connection.guest_name?.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white">{connection.guest_name}, {connection.guest_age}</p>
          <p className="text-sm text-muted">{connection.guest_city} &middot; Day {Math.min(progress + 1, 8)} of 8</p>
        </div>
        <span className="text-xs font-medium text-gold">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function YourStandardsPage() {
  const router = useRouter();
  const [standard] = useState<Standard | null>(MOCK_STANDARD);
  const connections = MOCK_CONNECTIONS;
  const applicants = connections.filter((c) => c.status === 'pending');
  const inProgress = connections.filter((c) => c.status === 'active' && c.tasks_completed < 8);
  const completed = connections.filter((c) => c.status === 'active' && c.tasks_completed >= 8);

  if (!standard) {
    return (
      <div className="empty-state animate-fade-in min-h-[80vh]">
        <div className="empty-state-icon">
          <Plus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No Standard Yet</h2>
        <p className="text-muted text-sm max-w-xs mb-8">
          Set your standard to start meeting people
        </p>
        <button
          onClick={() => router.push('/your-standards/create')}
          className="btn-primary text-lg"
        >
          Create Your Standard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="py-6">
        <h1 className="font-display text-3xl text-white font-semibold">
          Your Standard
        </h1>
        <p className="text-muted text-sm mt-1">Difficulty: {standard.difficulty}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gold">{applicants.length}</p>
          <p className="text-xs text-muted mt-1">Applicants</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{inProgress.length}</p>
          <p className="text-xs text-muted mt-1">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{completed.length}</p>
          <p className="text-xs text-muted mt-1">Connected</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => router.push('/your-standards/edit')}
          className="flex-1 btn-secondary flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Standard
        </button>
        <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
          <Pause className="w-4 h-4" />
          {standard.is_active ? 'Pause' : 'Resume'}
        </button>
      </div>

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
          <button
            onClick={() => router.push('/interested')}
            className="w-full btn-ghost mt-3 text-sm"
          >
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
        <div className="empty-state py-16">
          <div className="empty-state-icon">
            <Users className="w-8 h-8" />
          </div>
          <p className="text-muted text-sm">No connections yet</p>
        </div>
      )}
    </div>
  );
}
