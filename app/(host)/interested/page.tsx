'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Check, Clock, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestCard {
  id: string;
  connectionId: string;
  name: string;
  age: number;
  photo?: string;
  currentDay: number;
  progress: number;
  status: 'submitted' | 'waiting';
}

const MOCK_APPLICANTS: GuestCard[] = [
  {
    id: 'g1',
    connectionId: 'c1',
    name: 'Priya',
    age: 28,
    currentDay: 1,
    progress: 1,
    status: 'submitted',
  },
  {
    id: 'g2',
    connectionId: 'c2',
    name: 'Arjun',
    age: 30,
    currentDay: 1,
    progress: 0,
    status: 'waiting',
  },
];

const MOCK_IN_PROGRESS: GuestCard[] = [
  {
    id: 'g3',
    connectionId: 'c3',
    name: 'Ananya',
    age: 26,
    currentDay: 3,
    progress: 3,
    status: 'submitted',
  },
];

const MOCK_CONNECTED: GuestCard[] = [];

const TABS = ['Applicants', 'In Progress', 'Connected'] as const;

const TOTAL_INTENTIONS = 8;

function GuestCard({ guest, onReview }: { guest: GuestCard; onReview: (id: string) => void }) {
  const pct = Math.round((guest.progress / TOTAL_INTENTIONS) * 100);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0 overflow-hidden">
          {guest.photo ? (
            <img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-medium text-white">
              {guest.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{guest.name}, {guest.age}</p>
            {guest.status === 'submitted' && (
              <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                Pending review
              </span>
            )}
          </div>
          <p className="text-sm text-muted">Day {guest.currentDay}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted">{guest.progress}/{TOTAL_INTENTIONS}</span>
          </div>
        </div>
        <button
          onClick={() => onReview(guest.connectionId)}
          className={cn(
            'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-400 ease-out',
            guest.status === 'submitted'
              ? 'bg-gold text-black hover:bg-gold-light'
              : 'bg-surface text-muted border border-border'
          )}
        >
          {guest.status === 'submitted' ? 'Review' : 'View'}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; text: string }> = {
    Applicants: {
      title: 'No applicants yet',
      text: 'No one has started your standard yet.',
    },
    'In Progress': {
      title: 'No active connections',
      text: 'No active connections.',
    },
    Connected: {
      title: 'No completed connections',
      text: 'No completed connections yet.',
    },
  };

  const info = messages[tab] || messages.Applicants;

  return (
    <div className="empty-state py-16">
      <div className="empty-state-icon">
        <Users className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{info.title}</h3>
      <p className="text-muted text-sm">{info.text}</p>
    </div>
  );
}

export default function InterestedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Applicants');

  const applicants = MOCK_APPLICANTS;
  const inProgress = MOCK_IN_PROGRESS;
  const connected = MOCK_CONNECTED;

  const tabData: Record<typeof TABS[number], GuestCard[]> = {
    Applicants: applicants,
    'In Progress': inProgress,
    Connected: connected,
  };

  const currentList = tabData[activeTab];

  function handleReview(connectionId: string) {
    router.push(`/review/${connectionId}`);
  }

  return (
    <div className="animate-fade-in py-6">
      <button
        onClick={() => router.back()}
        className="btn-ghost flex items-center gap-2 text-muted hover:text-white -ml-2 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="font-display text-3xl text-white font-semibold mb-6">
        Interested In You
      </h1>

      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ease-out',
              activeTab === tab
                ? 'bg-gold text-black'
                : 'text-muted hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {currentList.length > 0 ? (
          currentList.map((guest) => (
            <GuestCard key={guest.id} guest={guest} onReview={handleReview} />
          ))
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </div>
    </div>
  );
}
