'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, ChevronRight, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn, formatTimeLeft } from '@/lib/utils';
import type { Connection } from '@/types';

type TabKey = 'in-progress' | 'connected' | 'ended';

interface ExtendedConnection extends Connection {
  hostName: string;
  hostPhoto?: string;
  totalTasks: number;
}

const MOCK_CONNECTIONS: ExtendedConnection[] = [
  {
    id: 'c1',
    test_id: 's1',
    guest_id: 'g1',
    host_id: 'h1',
    status: 'active',
    tasks_completed: 5,
    expires_at: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    hostName: 'Priya',
    totalTasks: 8,
  },
  {
    id: 'c2',
    test_id: 's2',
    guest_id: 'g1',
    host_id: 'h2',
    status: 'chat_unlocked',
    tasks_completed: 8,
    expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400 * 1000).toISOString(),
    hostName: 'Ananya',
    totalTasks: 8,
  },
  {
    id: 'c3',
    test_id: 's3',
    guest_id: 'g1',
    host_id: 'h3',
    status: 'expired',
    tasks_completed: 3,
    expires_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    hostName: 'Riya',
    totalTasks: 8,
  },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'in-progress', label: 'In Progress' },
  { key: 'connected', label: 'Connected' },
  { key: 'ended', label: 'Ended' },
];

function ConnectionCard({
  connection,
  onContinue,
  onMessage,
}: {
  connection: ExtendedConnection;
  onContinue: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const isChatUnlocked = connection.status === 'chat_unlocked' || connection.status === 'completed';
  const isEnded = connection.status === 'expired' || connection.status === 'rejected';

  return (
    <div className="card flex items-center gap-3 p-3 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-display text-muted">
          {connection.hostName.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-white">{connection.hostName}</h3>
        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
          <span>Day {Math.min(connection.tasks_completed + 1, connection.totalTasks)} of {connection.totalTasks}</span>
          <span className="w-1 h-1 rounded-full bg-surface-light" />
          <span>{connection.tasks_completed}/{connection.totalTasks}</span>
          {!isEnded && (
            <>
              <span className="w-1 h-1 rounded-full bg-surface-light" />
              <span>{formatTimeLeft(connection.expires_at)} left</span>
            </>
          )}
        </div>
      </div>

      {isEnded ? (
        <div className="text-xs text-muted flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Ended
        </div>
      ) : isChatUnlocked ? (
        <button
          onClick={() => onMessage(connection.id)}
          className="flex items-center gap-1.5 text-xs bg-gold text-black font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-gold-light active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </button>
      ) : (
        <button
          onClick={() => onContinue(connection.id)}
          className="flex items-center gap-1.5 text-xs bg-surface text-white border border-border font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-surface-light active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');

  const filteredConnections = MOCK_CONNECTIONS.filter((c) => {
    switch (activeTab) {
      case 'in-progress':
        return c.status === 'active';
      case 'connected':
        return c.status === 'chat_unlocked' || c.status === 'completed';
      case 'ended':
        return c.status === 'expired' || c.status === 'rejected';
      default:
        return false;
    }
  });

  const handleContinue = (id: string) => {
    const conn = MOCK_CONNECTIONS.find((c) => c.id === id);
    if (conn) router.push(`/${conn.hostName.toLowerCase()}`);
  };

  const handleMessage = (id: string) => {
    router.push(`/messages/${id}`);
  };

  const renderEmptyState = () => {
    switch (activeTab) {
      case 'in-progress':
        return (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No connections yet.</h3>
            <p className="empty-state-text">Browse Discover to find someone with standards you&apos;d like to meet.</p>
            <button
              onClick={() => router.push('/discover')}
              className="btn-primary mt-6"
            >
              Browse Discover
            </button>
          </div>
        );
      case 'connected':
        return (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No connections yet.</h3>
            <p className="empty-state-text">Complete 8 intentions to connect with someone.</p>
          </div>
        );
      case 'ended':
        return (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">Nothing here yet.</h3>
            <p className="empty-state-text">Connections that ended will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          onClick={() => router.push('/discover')}
          className="btn-ghost p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display text-white">Connections</h1>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1 mt-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 text-sm font-medium rounded-lg px-3 py-2 transition-all duration-300 ease-out',
              activeTab === tab.key
                ? 'bg-gold text-black'
                : 'text-muted hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 pb-24">
        {filteredConnections.length > 0 ? (
          filteredConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onContinue={handleContinue}
              onMessage={handleMessage}
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}
