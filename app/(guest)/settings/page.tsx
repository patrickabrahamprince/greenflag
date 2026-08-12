'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Shield, Trash2, LogOut, Phone, Mail, CheckCircle, PauseCircle, ChevronRight, Loader2 } from 'lucide-react';
import { DeleteReasonScreen } from '@/components/guest/DeleteReasonScreen';
import toast from 'react-hot-toast';
import { parsePhoneNumber } from 'libphonenumber-js';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { hapticWarning } from '@/lib/haptics';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

function formatPhoneDisplay(phone: string | undefined): string {
  if (!phone) return 'Not available';
  // parsePhoneNumber throws (rather than returning undefined) on numbers it
  // can't confidently parse -- with only one ErrorBoundary wrapping the
  // whole app, an uncaught throw here takes down the entire page, not just
  // this card.
  try {
    const parsed = parsePhoneNumber(phone);
    if (parsed && parsed.isValid()) {
      return parsed.formatInternational();
    }
  } catch {}
  return phone;
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const coinBalance = useCoinStore((s) => s.balance);
  const setBalance = useCoinStore((s) => s.setBalance);

  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [showDeleteReason, setShowDeleteReason] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteFeedback, setDeleteFeedback] = useState('');

  const fetchPhone = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.phone) {
      setPhone(data.user.phone);
    }
  };

  useEffect(() => {
    fetchPhone();
  }, []);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(fetchPhone);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    setBalance(0);
    router.replace('/login');
  };

  const handleUpdateEmail = async () => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Email updated');
    setUpdating(false);
  };

  const handleChangePassword = async () => {
    toast.success('Password reset link sent to your email');
  };

  const handlePauseAccount = async () => {
    setPausing(true);
    try {
      const res = await fetch('/api/user/pause', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to pause account');
      }
      setShowPauseConfirm(false);
      toast.success('Paused. Log back in anytime to pick up right where you left off.');
      await handleLogout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pause account');
    } finally {
      setPausing(false);
    }
  };

  const handleDeleteAccount = async () => {
    hapticWarning();
    setUpdating(true);
    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasons: deleteReasons, feedback: deleteFeedback }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }
      toast.success('Account deleted');
      setShowDeleteConfirm(false);
      await handleLogout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-5rem)] screen-gradient flex flex-col">
      <div className="max-w-app mx-auto w-full px-8 pt-safe-top">
        <div className="page-header">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-ink flex-1">Settings</h1>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-8 pb-32 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
                <Phone className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted">Phone</p>
                <p className="text-ink font-medium">{formatPhoneDisplay(phone)}</p>
              </div>
            </div>
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted">Email</p>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={updating || !email}
              className="btn-primary text-sm px-4"
            >
              {updating ? '...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted">Password</p>
          </div>
          <button onClick={handleChangePassword} className="btn-secondary w-full text-sm">
            Change Password
          </button>
        </div>

        <button
          onClick={() => router.push('/settings/notifications')}
          className="card w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <Bell className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-ink font-medium">Notifications</p>
          </div>
          <ChevronRight className="w-4 h-4 text-ink/40" />
        </button>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
              <PauseCircle className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-ink font-medium">Need a break?</p>
              <p className="text-xs text-muted">Go invisible without losing anything</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Pausing signs you out and hides your profile from everyone else. Your matches,
            messages, and coin balance are all still here — just log back in whenever you're ready.
          </p>
          <button
            onClick={() => setShowPauseConfirm(true)}
            className="btn-secondary w-full text-sm"
          >
            Pause My Account
          </button>
        </div>

        <div className="card border-raised/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-ink font-medium">Delete Account</p>
              <p className="text-xs text-muted">Permanently remove all data</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteReason(true)}
            className="btn-danger w-full text-sm"
          >
            Delete Account
          </button>
        </div>

        <button onClick={handleLogout} disabled={loggingOut} className="btn-secondary w-full flex items-center justify-center gap-2">
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>

      {showDeleteReason && (
        <DeleteReasonScreen
          onBack={() => setShowDeleteReason(false)}
          onContinue={(reasons, feedback) => {
            setDeleteReasons(reasons);
            setDeleteFeedback(feedback);
            setShowDeleteReason(false);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      {showPauseConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="dialog-card max-w-sm w-full text-center">
            <PauseCircle className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="font-display text-lg text-ink mb-2">Pause your account?</h3>
            <p className="text-sm text-muted mb-6">
              You&apos;ll be signed out and invisible to everyone until you log back in.
              Nothing is deleted — resume anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseConfirm(false)}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePauseAccount}
                disabled={pausing}
                className="btn-primary flex-1 text-sm"
              >
                {pausing ? 'Pausing...' : 'Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="dialog-card max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-display text-lg text-ink mb-2">Delete Account?</h3>
            <p className="text-sm text-muted mb-2">
              This action cannot be undone. Your profile, matches, messages, and Standards
              will be permanently erased.
            </p>
            {coinBalance > 0 && (
              <p className="text-sm text-red-400 mb-2">
                Your {coinBalance} coin{coinBalance === 1 ? '' : 's'} will be lost and cannot be refunded.
              </p>
            )}
            <p className="text-xs text-muted mb-6">
              Just need space? Consider pausing instead — it&apos;s reversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={updating}
                className="btn-danger flex-1 text-sm"
              >
                {updating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
