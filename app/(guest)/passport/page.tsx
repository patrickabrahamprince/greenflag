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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E3F2FD] via-[#F0F7FF] to-[#FAF8F5] text-stone-900 font-sans max-w-md mx-auto relative overflow-hidden flex flex-col pb-28">
      
      {/* Top Ambient Glow Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-200/50 via-indigo-100/30 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-[max(20px,env(safe-area-inset-top,20px))] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-purple-500 to-sky-400">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00E5A3] rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-[800] text-[#18181B] tracking-tight">Passport & Profile</h1>
            <p className="text-[12px] font-semibold text-stone-500">{displayCity} · Verified Member</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.push('/settings');
          }}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-white transition cursor-pointer active:scale-95"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-stone-700" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-4 pt-1">
        
        {/* 1. Bento Trust / Performance Card (Sky & Mint Glow) */}
        <div className="rounded-[28px] bg-white border border-stone-200/70 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A3]" />
              <span className="text-[13px] font-[800] text-stone-900">Green Trust Score</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Top 5%
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* SVG Circular Ring 90% */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="#00E5A3"
                  strokeDasharray="90, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-[900] text-[15px] text-stone-900">4.9</span>
            </div>

            <div className="flex-1">
              <p className="text-[12px] font-medium text-stone-600 leading-snug">
                Your trust rating is based on verified identification, on-time arrivals, and host reviews.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Verification Badges Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#D7F5E8] rounded-[24px] p-3.5 border border-emerald-200/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-[12px] font-[800] text-emerald-950">ID Checked</div>
              <div className="text-[10px] text-emerald-900/70 font-medium">Govt verified</div>
            </div>
          </div>

          <div className="bg-[#DDF0FE] rounded-[24px] p-3.5 border border-sky-200/60 shadow-xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              ✓
            </div>
            <div>
              <div className="text-[12px] font-[800] text-sky-950">Face Match</div>
              <div className="text-[10px] text-sky-900/70 font-medium">Real photo 100%</div>
            </div>
          </div>
        </div>

        {/* 3. Stat Capsules */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-[22px] p-3 text-center border border-stone-200/70 shadow-xs">
            <div className="text-[18px] font-[900] text-stone-900">18</div>
            <div className="text-[10px] font-bold text-stone-500 mt-0.5">Trips Taken</div>
          </div>
          <div className="bg-white rounded-[22px] p-3 text-center border border-stone-200/70 shadow-xs">
            <div className="text-[18px] font-[900] text-stone-900">92%</div>
            <div className="text-[10px] font-bold text-stone-500 mt-0.5">On-Time Rate</div>
          </div>
          <div className="bg-white rounded-[22px] p-3 text-center border border-stone-200/70 shadow-xs">
            <div className="text-[18px] font-[900] text-stone-900">6</div>
            <div className="text-[10px] font-bold text-stone-500 mt-0.5">Hosted</div>
          </div>
        </div>

        {/* 4. Women-Only Circle & Safety Center */}
        <div className="rounded-[26px] bg-[#F2E8FD] border border-purple-200/60 p-4 shadow-sm flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-[800] text-purple-950">Women-Only Circles 👩‍🦰</div>
            <p className="text-[11px] text-purple-900/70 font-medium mt-0.5">
              Verified small groups with trusted women hosts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              toast.success('Joined Bangalore Women Circle!');
            }}
            className="px-3.5 py-2 rounded-full bg-[#18181B] text-white text-[11px] font-bold active:scale-95 transition shrink-0 cursor-pointer"
          >
            Join
          </button>
        </div>

        {/* 5. Account Settings Actions */}
        <div className="bg-white rounded-[26px] border border-stone-200/70 p-2 shadow-sm divide-y divide-stone-100">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowPauseConfirm(true);
            }}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-stone-50 transition rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <PauseCircle className="w-4 h-4 text-stone-600" />
              <span className="text-[13px] font-semibold text-stone-800">Pause Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowLogoutConfirm(true);
            }}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-stone-50 transition rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-amber-600" />
              <span className="text-[13px] font-semibold text-amber-900">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowDeleteReason(true);
            }}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-rose-50 transition rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span className="text-[13px] font-semibold text-rose-700">Delete Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

      </main>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] p-6 max-w-xs w-full text-center space-y-4 shadow-xl border border-stone-200 animate-scale-up">
            <h3 className="text-[17px] font-[800] text-stone-900">Sign Out?</h3>
            <p className="text-[12px] text-stone-600">You can log back in anytime with your phone number.</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-700 text-[12px] font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-full bg-[#18181B] text-white text-[12px] font-bold flex items-center justify-center"
              >
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] p-6 max-w-xs w-full text-center space-y-4 shadow-xl border border-stone-200 animate-scale-up">
            <h3 className="text-[17px] font-[800] text-stone-900">Pause Account?</h3>
            <p className="text-[12px] text-stone-600">Your profile and trips will be hidden until you sign in again.</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowPauseConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-700 text-[12px] font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseAccount}
                disabled={pausing}
                className="flex-1 py-2.5 rounded-full bg-[#18181B] text-white text-[12px] font-bold flex items-center justify-center"
              >
                {pausing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reason Modal */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] p-6 max-w-xs w-full text-center space-y-4 shadow-xl border border-stone-200 animate-scale-up">
            <h3 className="text-[17px] font-[800] text-rose-600">Permanently Delete?</h3>
            <p className="text-[12px] text-stone-600">This action cannot be undone. All your bookings and profile history will be erased.</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-700 text-[12px] font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-[12px] font-bold flex items-center justify-center"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
