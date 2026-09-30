'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  Info, 
  Shield, 
  Sparkles, 
  Star, 
  Award, 
  Users,
  LogOut,
  Trash2,
  PauseCircle,
  Settings,
  ChevronRight,
  Loader2,
  Phone,
  Lock
} from 'lucide-react';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { DeleteReasonScreen } from '@/components/guest/DeleteReasonScreen';
import toast from 'react-hot-toast';

export default function PassportPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const coinBalance = useCoinStore((s) => s.balance);
  const setBalance = useCoinStore((s) => s.setBalance);

  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteReason, setShowDeleteReason] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteFeedback, setDeleteFeedback] = useState('');

  const handleLogout = async () => {
    hapticTap();
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearUser();
      setBalance(0);
      router.replace('/login');
    } catch {
      toast.error('Failed to sign out. Please try again.');
      setLoggingOut(false);
    }
  };

  const handlePauseAccount = async () => {
    hapticTap();
    setPausing(true);
    try {
      const res = await fetch('/api/user/pause', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to pause account');
      }
      setShowPauseConfirm(false);
      toast.success('Account paused. Log back in anytime to pick up where you left off.');
      await handleLogout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pause account');
      setPausing(false);
    }
  };

  const handleDeleteAccount = async () => {
    hapticWarning();
    setDeleting(true);
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
      toast.success('Your account has been deleted.');
      setShowDeleteConfirm(false);
      await handleLogout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  const displayName = user?.name || 'Explorer';
  const displayCity = user?.city || 'Bangalore';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col font-[Inter] relative overflow-x-hidden text-black max-w-md mx-auto">
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Main Passport Content */}
      <div className="flex-1 px-5 pt-[max(16px,env(safe-area-inset-top,16px))] pb-36">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-[800] tracking-tight">Passport & Account</h1>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/settings');
            }}
            className="p-2 rounded-full bg-white border border-black/10 hover:bg-black/5 active:scale-95 transition"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-black/70" />
          </button>
        </div>

        {/* Hero Passport Card */}
        <div className="relative rounded-[26px] bg-black text-white p-5 overflow-hidden shadow-xl">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-[20px] opacity-60 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full blur-[24px] opacity-50 pointer-events-none" />

          {/* Avatar & Badges */}
          <div className="relative flex gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
              <div className="absolute inset-[3px] rounded-full bg-black flex items-center justify-center font-bold text-[24px]">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center border-2 border-black">
                12
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-[800] text-[20px] leading-none truncate">
                {displayName} · Level 12 Explorer
              </div>
              <div className="text-[12px] opacity-70 mt-1.5 truncate">
                {displayCity} · Member since 2024
              </div>
              <div className="mt-2.5 flex gap-1.5 flex-wrap">
                {['On-Time 10x', 'Top Host', 'Photo Pro'].map((b) => (
                  <span
                    key={b}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 border border-white/15 font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Green Score Circular SVG Ring */}
          <div className="relative mt-5 flex items-center gap-4">
            <div className="w-16 h-16 relative shrink-0">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="url(#passportGrad)"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="159.74 163"
                  strokeLinecap="round"
                />
              </svg>
              <defs>
                <linearGradient id="passportGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[800] text-[17px] leading-none">4.9</span>
                <span className="text-[8px] tracking-widest opacity-60 font-bold">GREEN</span>
              </div>
            </div>

            <div className="text-[12px] leading-relaxed opacity-80 flex-1">
              Green Score reflects trust. Yours is{' '}
              <span className="text-white font-bold underline decoration-emerald-400 decoration-2">
                top 5% in {displayCity}
              </span>
              . Keep it up!
            </div>

            <button
              type="button"
              onClick={() => setShowScoreInfo(!showScoreInfo)}
              className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25 transition shrink-0"
            >
              <Info className="w-4 h-4 text-white" />
            </button>
          </div>

          {showScoreInfo && (
            <div className="mt-3 p-3 rounded-2xl bg-white text-black text-[11px] leading-relaxed shadow-lg animate-fade-in">
              <strong>Green Score Breakdown:</strong> On-time arrival + Verified ID + Positive trip ratings + Safety guidelines adherence. High score unlocks overnight Getaway hosting.
            </div>
          )}
        </div>

        {/* Verification Status Badges */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { k: 'Face Verified', ok: true, icon: '🤳' },
            { k: 'Govt ID Checked', ok: true, icon: '🪪' },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-2xl bg-white border border-black/10 p-3.5 flex items-center gap-2.5 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[18px] shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[12px] truncate">{item.k}</div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3-Column Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { v: '18', l: 'Trips', grad: 'from-amber-300 to-orange-400' },
            { v: '4.9', l: 'Avg Rating', grad: 'from-emerald-400 to-teal-500' },
            { v: '92%', l: 'On-Time', grad: 'from-violet-400 to-fuchsia-500' },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-2xl bg-white border border-black/10 p-3 text-center shadow-sm"
            >
              <div
                className={`inline-flex w-8 h-8 rounded-full bg-gradient-to-br ${stat.grad} text-white font-bold items-center justify-center text-[13px] shadow-sm`}
              >
                {stat.v}
              </div>
              <div className="text-[11px] font-bold mt-1.5 text-black/60">{stat.l}</div>
            </div>
          ))}
        </div>

        {/* Women-Only Circles Card */}
        <div className="mt-4 rounded-[22px] bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 border border-rose-100 p-4 flex gap-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-sm shrink-0 text-[20px]">
            👩
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[13px]">Women-Only Circles 👩‍🦰</div>
            <div className="text-[11px] text-black/60 mt-1 leading-relaxed">
              Curated small groups, women hosts, extra safety verification layers. Join Bangalore Circle (24 members).
            </div>
            <button
              type="button"
              onClick={() => {
                hapticSuccess();
                toast.success('Joined Bangalore Women Circle!');
              }}
              className="mt-2.5 h-8 px-3.5 rounded-full bg-black text-white text-[11px] font-bold active:scale-95 transition cursor-pointer shadow-xs"
            >
              Explore Circle
            </button>
          </div>
        </div>

        {/* My Sparks Card with PRO Blurred Previews */}
        <div className="mt-4 rounded-[22px] bg-white border border-black/10 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="font-bold text-[14px]">My Sparks ✨</div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-xs">
              PRO
            </span>
          </div>

          <div className="mt-3 flex gap-2.5">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="flex-1 rounded-2xl bg-[#faf8f5] border border-black/5 p-2 text-center relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-full mx-auto bg-gradient-to-br from-rose-300 to-pink-400 blur-[2px]" />
                <div className="mt-2 h-2 w-8 mx-auto bg-black/10 rounded-full blur-[1px]" />
                <div className="mt-1 h-1.5 w-5 mx-auto bg-black/10 rounded-full blur-[1px]" />
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black text-white shadow-xs">
                    PRO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Center Banner */}
        <div className="mt-4 rounded-[22px] bg-black text-white p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[13px]">Safety Center</div>
            <div className="text-[11px] opacity-70">
              Live location share, SOS emergency, public meet spots.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              toast.success('Live Location Share link copied!');
            }}
            className="h-8 px-3 rounded-full bg-white text-black font-bold text-[11px] active:scale-95 transition cursor-pointer shadow-xs shrink-0"
          >
            Share Live
          </button>
        </div>

        {/* Account Management & Security Section */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/50 px-1 mb-2.5">
            Account & Security
          </h2>
          
          <div className="bg-white rounded-[24px] border border-black/10 p-2 shadow-sm space-y-1">
            {/* Pause Account Option */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setShowPauseConfirm(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-black/5 active:scale-[0.99] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <PauseCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px]">Pause Account</div>
                  <div className="text-[11px] text-black/50">Temporarily go invisible</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/30" />
            </button>

            <div className="h-px bg-black/5 mx-3" />

            {/* Delete Account Option */}
            <button
              type="button"
              onClick={() => {
                hapticWarning();
                setShowDeleteReason(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50/50 active:scale-[0.99] transition text-left cursor-pointer text-red-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px]">Delete Account</div>
                  <div className="text-[11px] text-red-500/80">Permanently erase all data</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400/60" />
            </button>

            <div className="h-px bg-black/5 mx-3" />

            {/* Sign Out Option */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-red-50/50 active:scale-[0.99] transition text-left cursor-pointer text-red-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100/80 text-red-700 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px]">Sign Out</div>
                  <div className="text-[11px] text-red-600/70">Log out of your session</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400/60" />
            </button>
          </div>
        </div>

      </div>

      {/* Delete Reason Screen Overlay */}
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

      {/* Pause Confirmation Modal */}
      {showPauseConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full text-center shadow-2xl border border-black/10">
            <PauseCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-[800] text-xl text-black mb-2">Pause your account?</h3>
            <p className="text-xs text-black/60 mb-6 leading-relaxed">
              You will be signed out and hidden from other explorers. Your matches, trips, and settings will remain safe until you log back in.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPauseConfirm(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-black font-bold rounded-full text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseAccount}
                disabled={pausing}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                {pausing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full text-center shadow-2xl border border-black/10">
            <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="font-[800] text-xl text-black mb-2">Delete Account?</h3>
            <p className="text-xs text-black/60 mb-2 leading-relaxed">
              This action cannot be undone. All your profile data, trips, chats, and ratings will be permanently deleted.
            </p>
            {coinBalance > 0 && (
              <p className="text-xs font-semibold text-red-500 mb-2">
                Your {coinBalance} coin{coinBalance === 1 ? '' : 's'} will be lost permanently.
              </p>
            )}
            <p className="text-[11px] text-black/40 mb-6">
              Just need time off? Consider pausing instead.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-black font-bold rounded-full text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full text-center shadow-2xl border border-black/10">
            <LogOut className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="font-[800] text-xl text-black mb-2">Sign out?</h3>
            <p className="text-xs text-black/60 mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to sign in again to access your trips and passport.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-black font-bold rounded-full text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
