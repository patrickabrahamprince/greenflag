'use client';

import { Loader2 } from 'lucide-react';
import { ManConnectionCard } from '@/components/connections/ManConnectionCard';
import { ConnectionsEmptyState } from '@/components/connections/ConnectionsEmptyState';
import { useManConnections } from '@/components/connections/useManConnections';

export default function MyConnectionsPage() {
  const { connections, loading } = useManConnections();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#00C853]" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 pt-6 pb-24 max-w-app mx-auto"
      style={{ background: '#0A0A0A' }}
    >
      <h1 className="font-display italic text-2xl text-[#EDEADE] mb-6">
        My Connections
      </h1>

      {connections.length === 0 ? (
        <ConnectionsEmptyState
          title="No connections yet"
          description="Browse Discover to find someone with standards you'd like to meet."
        />
      ) : (
        <div className="space-y-2">
          {connections.map((c) => (
            <ManConnectionCard
              key={c.id}
              connectionId={c.id}
              womanName={c.womanName}
              womanPhoto={c.womanPhoto}
              currentDay={c.currentDay}
              status={c.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
