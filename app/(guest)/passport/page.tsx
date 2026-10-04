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
  Share2,
  Plane,
  Mountain,
  Coffee,
  Waves,
  Compass
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
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      
      {/* ================= APPLE DESIGN KIT FROZEN HEADER ================= */}
      <header className="shrink-0 z-30 bg-white/85 backdrop-blur-2xl backdrop-saturate-180 pt-safe-top pb-3 px-5 flex items-center justify-between border-b border-black/[0.08]">
        {/* User Avatar + Greeting */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full ring-1 ring-black/[0.08] shadow-2xs overflow-hidden flex items-center justify-center bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Korina';
                }}
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#8E8E93] leading-none">Verified Member</div>
            <div className="text-[15px] font-bold text-[#000000] tracking-tight leading-tight mt-0.5">{displayName}</div>
          </div>
        </div>

        {/* Top Right: Settings Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/settings');
            }}
            className="w-8 h-8 rounded-full bg-[#767680]/12 hover:bg-[#767680]/18 flex items-center justify-center text-[#000000] active:scale-95 transition cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-[#000000]" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-5 space-y-4 pt-3 pb-36 z-10">
        
        {/* Apple Native Segmented Control */}
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8E8E93]">
              Travel & Dating Passport
            </span>
            <h1 className="text-[26px] font-bold text-[#000000] tracking-tight leading-tight">
              Member Passport
            </h1>
          </div>

          <div className="bg-[#767680]/12 p-0.5 rounded-xl flex items-center">
            {[
              { id: 'pass', label: 'Boarding Pass' },
              { id: 'stamps', label: 'Trip Stamps' },
              { id: 'verified', label: 'Trust & Safety' },
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
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-white text-[#000000] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                      : 'text-[#8E8E93] hover:text-[#000000]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: DATING BOARDING PASS */}
        {activeTab === 'pass' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1. LUXURY OBSIDIAN BOARDING PASS */}
            <div className="bg-[#1C1C1E] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden space-y-3.5 border border-stone-800">
              
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold text-[10px] tracking-wider uppercase">
                    Travel Dating Pass
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">GF-SPARK-8842</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Upper Route Split Block */}
              <div className="relative flex gap-2">
                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Home Base</div>
                  <div className="text-[20px] font-extrabold text-white tracking-tight leading-none mt-1">BLR</div>
                  <div className="text-[11px] font-medium text-stone-300 truncate mt-0.5">
                    {displayCity.split(',')[0]}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white text-[#1C1C1E] shadow-md flex items-center justify-center self-center -mx-3 z-10">
                  <Compass className="w-4 h-4 text-[#1C1C1E]" />
                </div>

                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 text-right border border-white/10">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Preference</div>
                  <div className="text-[20px] font-extrabold text-white tracking-tight leading-none mt-1">SPARK</div>
                  <div className="text-[11px] font-medium text-stone-300 truncate mt-0.5">
                    Sunrise & Escapes
                  </div>
                </div>
              </div>

              {/* Perforated Divider Line */}
              <div className="relative -mx-5 my-1">
                <div className="border-t border-dashed border-white/20" />
                <div className="absolute -left-2.5 -top-2 w-4 h-4 rounded-full bg-white" />
                <div className="absolute -right-2.5 -top-2 w-4 h-4 rounded-full bg-white" />
              </div>

              {/* Middle Details Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Chemistry Rating</div>
                  <div className="text-[14px] font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span>4.95 ★</span>
                    <span className="text-[10px] font-semibold bg-white/15 px-1.5 py-0.2 rounded-md">Top 5%</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Single Explorer</div>
                  <div className="text-[14px] font-bold text-white mt-0.5">Level 15 Pro</div>
                </div>
              </div>

              {/* Share Boarding Pass Button */}
              <button
                type="button"
                onClick={() => {
                  hapticSuccess();
                  if (navigator.share) {
                    navigator.share({
                      title: `${displayName}'s GreenFlag Travel Dating Passport`,
                      text: `Check out my verified travel passport on GreenFlag!`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    toast.success('Passport link copied!');
                  }
                }}
                className="w-full py-3.5 rounded-full bg-white text-[#1C1C1E] font-bold text-[13px] shadow-sm hover:bg-stone-100 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Dating Passport</span>
              </button>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-3xl p-4 border border-stone-200 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Escapes</div>
                <div className="text-[18px] font-extrabold text-[#1C1C1E] mt-0.5">18 Completed</div>
                <div className="text-[11px] text-stone-500 font-medium mt-1">100% On-Time Host</div>
              </div>
              <div className="bg-[#F9FAFB] rounded-3xl p-4 border border-stone-200 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Mutual Sparks</div>
                <div className="text-[18px] font-extrabold text-[#1C1C1E] mt-0.5">12 Matches</div>
                <div className="text-[11px] text-stone-500 font-medium mt-1">Double-Blind Active</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVEL DATE STAMPS */}
        {activeTab === 'stamps' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-tight">
                Completed Travel Dates & Convoys
              </h3>
              <span className="text-[11px] font-semibold text-stone-500">3 Verified Passes</span>
            </div>

            {/* Pass 1: Clean Ticket */}
            <div className="bg-[#F9FAFB] rounded-3xl p-4 text-[#1C1C1E] shadow-2xs relative overflow-hidden space-y-3 border border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[18px] font-extrabold leading-none">BLR</div>
                  <div className="text-[10px] font-medium text-stone-500 mt-0.5">Bengaluru</div>
                </div>
                <div className="flex-1 px-4 flex items-center justify-center relative">
                  <div className="w-full border-t border-dashed border-stone-300" />
                  <div className="absolute w-6 h-6 rounded-full bg-white border border-stone-200 text-[#1C1C1E] shadow-xs flex items-center justify-center text-xs">
                    <Mountain className="w-3 h-3 text-[#1C1C1E]" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-extrabold leading-none">NND</div>
                  <div className="text-[10px] font-medium text-stone-500 mt-0.5">Nandi Hills</div>
                </div>
              </div>

              <div className="relative -mx-4 my-1">
                <div className="border-t border-dashed border-stone-200" />
                <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-white" />
                <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-white" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[13px] font-bold">Sunrise Cloud Dating Convoy</div>
                  <div className="text-[10px] font-medium text-stone-500">Completed (3 Pairs)</div>
                </div>
                <div className="text-[16px] font-extrabold">₹800</div>
              </div>
            </div>

            {/* Pass 2: Obsidian Ticket */}
            <div className="bg-[#1C1C1E] rounded-3xl p-4 text-white shadow-sm relative overflow-hidden space-y-3 border border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[18px] font-extrabold leading-none">BLR</div>
                  <div className="text-[10px] font-medium text-stone-400 mt-0.5">Bengaluru</div>
                </div>
                <div className="flex-1 px-4 flex items-center justify-center relative">
                  <div className="w-full border-t border-dashed border-white/20" />
                  <div className="absolute w-6 h-6 rounded-full bg-white text-[#1C1C1E] shadow-xs flex items-center justify-center text-xs">
                    <Coffee className="w-3 h-3 text-[#1C1C1E]" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-extrabold leading-none">CRG</div>
                  <div className="text-[10px] font-medium text-stone-400 mt-0.5">Coorg Estate</div>
                </div>
              </div>

              <div className="relative -mx-4 my-1">
                <div className="border-t border-dashed border-white/20" />
                <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-white" />
                <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-white" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[13px] font-bold">1-on-1 Coffee Tasting Date</div>
                  <div className="text-[10px] font-medium text-stone-400">Completed · 5.0 Star Chemistry</div>
                </div>
                <div className="text-[16px] font-extrabold">₹2,400</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRUST & SAFETY */}
        {activeTab === 'verified' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-[#F9FAFB] rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[15px] text-[#1C1C1E]">
                <Shield className="w-5 h-5 text-[#1C1C1E]" />
                <span>Trust & Identity Protocol</span>
              </div>
              <p className="text-[12px] text-stone-600 leading-relaxed font-normal">
                All members must pass government ID verification, real-time facial biometric match, and agree to verified public meetup points.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-3xl p-4 border border-stone-200 shadow-2xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#1C1C1E]">Govt ID Verified</div>
                  <div className="text-[10px] text-stone-500 font-medium">100% Verified Single</div>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-3xl p-4 border border-stone-200 shadow-2xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#1C1C1E]">Facial Match</div>
                  <div className="text-[10px] text-stone-500 font-medium">Real Photo Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ACCOUNT SETTINGS ACTIONS */}
        <div className="bg-[#F9FAFB] rounded-3xl border border-stone-200 p-2 shadow-2xs divide-y divide-stone-100">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowPauseConfirm(true);
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-100 transition rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <PauseCircle className="w-4 h-4 text-[#1C1C1E]" />
              <span className="text-[13px] font-bold text-[#1C1C1E]">Pause Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowLogoutConfirm(true);
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-100 transition rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-stone-600" />
              <span className="text-[13px] font-bold text-[#1C1C1E]">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowDeleteReason(true);
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/50 transition rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-stone-400 hover:text-rose-600" />
              <span className="text-[13px] font-semibold text-stone-500 hover:text-rose-600">Delete Account</span>
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
