'use client';

import { Loader2 } from 'lucide-react';
import { StandardHeader } from '@/components/connections/StandardHeader';
import { WomanConnectionCard } from '@/components/connections/WomanConnectionCard';
import { ConnectionsEmptyState } from '@/components/connections/ConnectionsEmptyState';
import { useWomanConnections } from '@/components/connections/useWomanConnections';

export default function WomanConnectionsPage() {
  const { connections, standard, intentionCount, loading } = useWomanConnections();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FAF9F7' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 pt-6 pb-24 max-w-app mx-auto"
      style={{ background: '#FAF9F7' }}
    >
      <StandardHeader
        intentionCount={intentionCount}
        activeDate={standard?.created_at ?? null}
      />

      {connections.length === 0 ? (
        <ConnectionsEmptyState
          title="No connections yet"
          description="Men who start your standard will appear here."
        />
      ) : (
        <div className="space-y-2">
          {connections.map((c) => (
            <WomanConnectionCard
              key={c.id}
              connectionId={c.id}
              manName={c.manName}
              manPhoto={c.manPhoto}
              currentDay={c.currentDay}
              status={c.status}
              deadline={c.deadline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
