'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  Ban,
  Clock,
  Users,
  Shield,
  Heart,
  RefreshCw,
  ChevronDown,
  Mic,
  Type as TypeIcon,
  Camera,
  Loader2,
  Circle,
} from 'lucide-react';

interface QueueItem {
  id: string;
  name: string;
  day: number;
  task: string;
  content: string | null;
  img: string;
  submitted_at: string;
  media_type: string | null;
}

interface MatchListItem {
  id: string;
  currentDay: number;
  status: string;
  createdAt: string;
  man: { id?: string; name: string; photo: string | null };
  woman: { id?: string; name: string; photo: string | null };
  submissionCounts: { total: number; approved: number; flagged: number };
}

type MediaFilter = 'all' | 'photo' | 'voice' | 'text';
type StatusFilter = 'all' | 'pending_submission' | 'pending_review' | 'completed' | 'rejected';

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending_submission: { label: 'Awaiting Submission', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  pending_review: { label: 'Pending Review', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  completed: { label: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  rejected: { label: 'Rejected', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  expired_no_submission: { label: 'Expired', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  refunded: { label: 'Refunded', dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 ring-gray-500/20' },
};

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

function LiveIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
        connected
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
          : 'bg-gray-50 text-gray-500 ring-gray-500/20'
      )}
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-gray-400')} />
      </span>
      {connected ? 'Live' : 'Reconnecting'}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, gradient, trend }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-gray-900/5',
        'ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5',
        gradient
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {trend}
          </span>
        )}
      </div>
      <p className="relative mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="relative mt-1 text-sm font-medium text-white/80">{label}</p>
    </div>
  );
}

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  mediaFilter: MediaFilter;
  onMediaChange: (v: MediaFilter) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  mediaFilter,
  onMediaChange,
  onRefresh,
  refreshing,
}: FilterBarProps) {
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'pending_submission', label: 'Awaiting' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, match ID..."
          className="w-full rounded-xl border border-transparent bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              statusFilter === opt.value
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <select
          value={mediaFilter}
          onChange={(e) => onMediaChange(e.target.value as MediaFilter)}
          className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All media</option>
          <option value="photo">Photo</option>
          <option value="voice">Voice</option>
          <option value="text">Text</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
        Refresh
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, ' '), dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 ring-gray-500/20' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ring-1 ring-inset', cfg.badge)}>
      <Circle className={cn('h-1.5 w-1.5 fill-current', cfg.dot.replace('bg-', 'text-'))} />
      {cfg.label}
    </span>
  );
}

function PersonAvatar({ person }: { person: { name: string; photo: string | null } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 ring-2 ring-white">
        {person.photo ? (
          <Image src={person.photo} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-blue-600">
            {person.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>
      <span className="truncate text-xs font-medium text-gray-700">{person.name}</span>
    </div>
  );
}

function MatchRow({
  match,
  onView,
  onEnd,
  ending,
}: {
  match: MatchListItem;
  onView: (id: string) => void;
  onEnd: (id: string) => void;
  ending: boolean;
}) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <PersonAvatar person={match.man} />
          <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-400 text-rose-400" />
          <PersonAvatar person={match.woman} />
        </div>
      </div>

      <div className="flex flex-1 items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Day</span>
          <span className="text-sm font-semibold text-gray-900">{match.currentDay} / 3</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Submissions</span>
          <span className="text-sm font-medium text-gray-700">
            {match.submissionCounts.approved}/{match.submissionCounts.total}
            {match.submissionCounts.flagged > 0 && (
              <span className="ml-1 text-rose-500">· {match.submissionCounts.flagged} flagged</span>
            )}
          </span>
        </div>
        <div className="hidden flex-col md:flex">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">Started</span>
          <span className="text-sm font-medium text-gray-700">{new Date(match.createdAt).toLocaleDateString()}</span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={() => onView(match.id)}
          title="View details"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye className="h-4 w-4" />
        </button>
        {!TERMINAL_STATUSES.includes(match.status) && (
          <button
            onClick={() => onEnd(match.id)}
            disabled={ending}
            title="End connection"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          >
            {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SlaTimer({ submittedAt }: { submittedAt: string }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - new Date(submittedAt).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${hrs}h ${mins}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [submittedAt]);

  const hrs = (Date.now() - new Date(submittedAt).getTime()) / 3600000;
  const urgent = hrs > 24;

  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', urgent ? 'text-rose-500' : 'text-gray-400')}>
      <Clock className="h-3 w-3" /> {elapsed}
    </span>
  );
}

function QueueRow({
  item,
  onApprove,
  onReject,
  moderating,
}: {
  item: QueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  moderating: boolean;
}) {
  const MediaIcon = item.media_type === 'voice' ? Mic : item.media_type === 'text' ? TypeIcon : Camera;

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50">
        {item.media_type === 'photo' && item.img ? (
          <img src={item.img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <MediaIcon className="h-5 w-5 text-blue-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
        <p className="truncate text-xs text-gray-500">Day {item.day} · {item.task || 'Untitled task'}</p>
      </div>

      <SlaTimer submittedAt={item.submitted_at} />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onApprove(item.id)}
          disabled={moderating}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
        >
          {moderating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Approve
        </button>
        <button
          onClick={() => onReject(item.id)}
          disabled={moderating}
          className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-40"
        >
          {moderating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          Reject
        </button>
      </div>
    </div>
  );
}

export function QueueMatchesDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [qRes, mRes] = await Promise.all([
        fetch('/api/admin/queue'),
        fetch('/api/admin/matches'),
      ]);
      if (qRes.ok) setQueue((await qRes.json()).items ?? []);
      if (mRes.ok) setMatches((await mRes.json()).matches ?? []);
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-queue-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => fetchAll(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchAll(true))
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchAll]);

  const handleApprove = useCallback(async (id: string) => {
    setModeratingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        toast.success('Submission approved');
        setQueue((prev) => prev.filter((i) => i.id !== id));
      } else {
        toast.error('Approve failed');
      }
    } finally {
      setModeratingId(null);
    }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    setModeratingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      });
      if (res.ok) {
        toast.success('Submission rejected');
        setQueue((prev) => prev.filter((i) => i.id !== id));
      } else {
        toast.error('Reject failed');
      }
    } finally {
      setModeratingId(null);
    }
  }, []);

  const handleEnd = useCallback(async (id: string) => {
    const reason = prompt('Reason for ending this connection (shown to both parties):');
    if (reason === null) return;
    setEndingId(id);
    try {
      const res = await fetch(`/api/admin/matches/${id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Connection ended');
        fetchAll(true);
      } else {
        toast.error(d.error || 'Failed to end connection');
      }
    } finally {
      setEndingId(null);
    }
  }, [fetchAll]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || m.man.name.toLowerCase().includes(q) || m.woman.name.toLowerCase().includes(q) || m.id.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [matches, statusFilter, search]);

  const filteredQueue = useMemo(() => {
    return queue.filter((i) => {
      const matchesMedia = mediaFilter === 'all' || i.media_type === mediaFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || i.name.toLowerCase().includes(q);
      return matchesMedia && matchesSearch;
    });
  }, [queue, mediaFilter, search]);

  const pendingReview = queue.length;
  const activeMatches = matches.filter((m) => !TERMINAL_STATUSES.includes(m.status)).length;
  const completedToday = matches.filter(
    (m) => m.status === 'completed' && new Date(m.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const flagged = matches.reduce((sum, m) => sum + m.submissionCounts.flagged, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Queue &amp; Matches</h1>
          <p className="mt-1 text-sm text-gray-500">Moderation queue and active connections, updated in real time.</p>
        </div>
        <LiveIndicator connected={connected} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Review" value={pendingReview} icon={Shield} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <StatCard label="Active Matches" value={activeMatches} icon={Users} gradient="bg-gradient-to-br from-blue-600 to-indigo-600" />
        <StatCard label="Completed Today" value={completedToday} icon={Heart} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" trend="+today" />
        <StatCard label="Flagged Submissions" value={flagged} icon={Ban} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        mediaFilter={mediaFilter}
        onMediaChange={setMediaFilter}
        onRefresh={() => fetchAll()}
        refreshing={refreshing}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Moderation Queue</h2>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{filteredQueue.length}</span>
            </div>
            <div className="space-y-2">
              {filteredQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
                  Queue is empty
                </div>
              ) : (
                filteredQueue.map((item) => (
                  <QueueRow
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    moderating={moderatingId === item.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Matches</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{filteredMatches.length}</span>
            </div>
            <div className="space-y-2">
              {filteredMatches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
                  <Filter className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                  No matches found
                </div>
              ) : (
                filteredMatches.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    onView={(id) => router.push(`/admin/matches/${id}`)}
                    onEnd={handleEnd}
                    ending={endingId === m.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueueMatchesDashboard;
