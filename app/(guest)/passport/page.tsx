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
  Lock,
  Bell,
  QrCode,
  Share2
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

  const [activeTab, setActiveTab] = useState<'pass' | 'stamps' | 'verified'>('pass');
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

  const displayName = user?.name || 'Korina Villanueva';
  const displayCity = user?.city || 'Bangalore, India';

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-stone-900 font-sans max-w-md mx-auto relative overflow-hidden flex flex-col pb-36 select-none antialiased">
      
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-to-b from-[#EFE9DF]/80 via-[#FAF8F5]/40 to-transparent pointer-events-none z-0" />

      {/* ================= AIRSWIFT TOP HEADER ================= */}
      <header className="px-6 pt-[max(16px,env(safe-area-inset-top,16px))] pb-2 sticky top-0 z-30 flex items-center justify-between bg-[#FAF8F5]/80 backdrop-blur-md">
        {/* User Avatar + Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-sm flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Korina';
                }}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500">Good Morning!</div>
            <div className="text-[15px] font-[900] text-[#18181B] tracking-tight">{displayName}</div>
          </div>
        </div>

        {/* Top Right Badges & Settings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#18181B] text-white px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[12px] font-[800]">12</span>
            <Bell className="w-3.5 h-3.5 text-white/90" />
          </div>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/settings');
            }}
            className="w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-800 hover:bg-stone-50 active:scale-95 transition cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-stone-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-5 pt-2 z-10">
        
        {/* Title + Pill Switcher */}
        <div className="space-y-3">
          <h1 className="text-[28px] font-[900] text-[#18181B] tracking-tight leading-tight">
            AirSwift Passport
          </h1>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'pass', label: 'Boarding Pass' },
              { id: 'stamps', label: 'Travel Stamps' },
              { id: 'verified', label: 'ID Verified' },
            ].map((pill) => {
              const isSelected = activeTab === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setActiveTab(pill.id as any);
                  }}
                  className={`px-5 py-2 rounded-full text-[13px] font-[700] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'bg-[#F2EDE4] text-stone-700 hover:bg-[#EAE4D9]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. GOLDEN SAFFRON AIRSWIFT BOARDING PASS (EXACT SCREENSHOT DESIGN) */}
        <div className="bg-[#F5A623] rounded-[32px] p-5 text-stone-900 shadow-xl relative overflow-hidden space-y-3">
          
          {/* Header Row: Passport Tag & QR icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-stone-950 font-[800] text-[10px] tracking-wider uppercase">
                Official Travel Pass
              </span>
              <span className="text-[11px] font-bold text-stone-950">GF-884291</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-stone-950" />
            </div>
          </div>

          {/* Upper Route Split Block with Circular Swap */}
          <div className="relative flex gap-2">
            <div className="flex-1 bg-[#F9BC45] rounded-2xl p-3 border border-black/5">
              <div className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Home Base</div>
              <div className="text-[22px] font-[900] text-stone-950 tracking-tight leading-none mt-1">BLR</div>
              <div className="text-[11px] font-semibold text-stone-800/80 truncate mt-0.5">
                {displayCity.split(',')[0]}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white shadow-md flex items-center justify-center text-xs font-bold self-center -mx-3 z-10">
              ✈
            </div>

            <div className="flex-1 bg-[#F9BC45] rounded-2xl p-3 text-right border border-black/5">
              <div className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Destination</div>
              <div className="text-[22px] font-[900] text-stone-950 tracking-tight leading-none mt-1">ANY</div>
              <div className="text-[11px] font-semibold text-stone-800/80 truncate mt-0.5">
                Global & Escapes
              </div>
            </div>
          </div>

          {/* Perforated Divider Line with Cutouts */}
          <div className="relative -mx-5 my-1">
            <div className="border-t border-dashed border-stone-800/20" />
            <div className="absolute -left-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
            <div className="absolute -right-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
          </div>

          {/* Middle Details Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F9BC45] rounded-2xl p-3 border border-black/5">
              <div className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Trust Score</div>
              <div className="text-[14px] font-[900] text-stone-950 mt-0.5 flex items-center gap-1">
                <span>4.95 ★</span>
                <span className="text-[10px] font-bold bg-black/10 px-1.5 py-0.2 rounded-md">Top 5%</span>
              </div>
            </div>

            <div className="bg-[#F9BC45] rounded-2xl p-3 border border-black/5">
              <div className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Explorer Rank</div>
              <div className="text-[14px] font-[900] text-stone-950 mt-0.5">Level 15 Pro</div>
            </div>
          </div>

          {/* Share Boarding Pass Button */}
          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              if (navigator.share) {
                navigator.share({
                  title: `${displayName}'s GreenFlag Passport`,
                  text: `Check out my verified travel passport and convoys on GreenFlag!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                toast.success('📋 Passport link copied to clipboard!');
              }
            }}
            className="w-full py-3.5 rounded-full bg-[#18181B] text-white font-[800] text-[14px] shadow-md hover:bg-black active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Digital Boarding Pass</span>
          </button>
        </div>

        {/* 2. STACKED FLIGHT & ROADTRIP BOARDING PASSES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-[900] text-[#18181B] tracking-tight">
              Recent Flights & Completed Convoys
            </h3>
            <span className="text-[11px] font-bold text-stone-500">3 Passes</span>
          </div>

          {/* Pass 1: Saffron Ticket */}
          <div className="bg-[#F5A623] rounded-[28px] p-4 text-stone-950 shadow-md relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[20px] font-[900] leading-none">BLR</div>
                <div className="text-[10px] font-bold text-stone-800 mt-0.5">Bengaluru</div>
              </div>
              <div className="flex-1 px-4 flex items-center justify-center relative">
                <div className="w-full border-t-2 border-dashed border-stone-800/40" />
                <div className="absolute w-7 h-7 rounded-full bg-white text-stone-900 shadow-sm flex items-center justify-center text-xs">
                  ⛰️
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-[900] leading-none">NND</div>
                <div className="text-[10px] font-bold text-stone-800 mt-0.5">Nandi Hills</div>
              </div>
            </div>

            <div className="relative -mx-4 my-1">
              <div className="border-t border-dashed border-stone-800/20" />
              <div className="absolute -left-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
              <div className="absolute -right-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[13px] font-[800]">Sunrise Cloud Convoy</div>
                <div className="text-[10px] font-medium text-stone-800/80">Sat 5:30 AM · Confirmed (3 Pairs)</div>
              </div>
              <div className="text-[22px] font-[900]">₹800</div>
            </div>
          </div>

          {/* Pass 2: Obsidian Ticket */}
          <div className="bg-[#181B1F] rounded-[28px] p-4 text-white shadow-md relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[20px] font-[900] leading-none">BLR</div>
                <div className="text-[10px] font-bold text-stone-400 mt-0.5">Bengaluru</div>
              </div>
              <div className="flex-1 px-4 flex items-center justify-center relative">
                <div className="w-full border-t-2 border-dashed border-white/20" />
                <div className="absolute w-7 h-7 rounded-full bg-white text-stone-900 shadow-sm flex items-center justify-center text-xs">
                  ☕
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-[900] leading-none">CRG</div>
                <div className="text-[10px] font-bold text-stone-400 mt-0.5">Coorg Estate</div>
              </div>
            </div>

            <div className="relative -mx-4 my-1">
              <div className="border-t border-dashed border-white/20" />
              <div className="absolute -left-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
              <div className="absolute -right-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[13px] font-[800]">Private Coffee Tasting</div>
                <div className="text-[10px] font-medium text-stone-400">Completed · 5.0 Star Rated</div>
              </div>
              <div className="text-[22px] font-[900]">₹2,400</div>
            </div>
          </div>

          {/* Pass 3: Blue Ticket */}
          <div className="bg-[#2A85C8] rounded-[28px] p-4 text-white shadow-md relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[20px] font-[900] leading-none">BLR</div>
                <div className="text-[10px] font-bold text-sky-100 mt-0.5">Bengaluru</div>
              </div>
              <div className="flex-1 px-4 flex items-center justify-center relative">
                <div className="w-full border-t-2 border-dashed border-white/30" />
                <div className="absolute w-7 h-7 rounded-full bg-white text-stone-900 shadow-sm flex items-center justify-center text-xs">
                  🌊
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-[900] leading-none">GOK</div>
                <div className="text-[10px] font-bold text-sky-100 mt-0.5">Gokarna Cliff</div>
              </div>
            </div>

            <div className="relative -mx-4 my-1">
              <div className="border-t border-dashed border-white/20" />
              <div className="absolute -left-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
              <div className="absolute -right-2.5 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[13px] font-[800]">Gokarna Beach Trail</div>
                <div className="text-[10px] font-medium text-sky-100/90">Women Safe Circle Verified</div>
              </div>
              <div className="text-[22px] font-[900]">₹1,200</div>
            </div>
          </div>
        </div>

        {/* 3. VERIFICATION BADGES BENTO GRID */}
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

        {/* 4. ACCOUNT SETTINGS ACTIONS */}
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
