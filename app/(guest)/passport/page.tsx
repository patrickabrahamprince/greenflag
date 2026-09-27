'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Star, 
  Award, 
  MapPin, 
  Users, 
  Heart, 
  Lock, 
  Sparkles, 
  Share2, 
  AlertCircle, 
  ChevronRight, 
  Check, 
  Flame, 
  Zap, 
  Settings, 
  Camera, 
  PhoneCall, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { ProSubscriptionModal } from '@/components/shared/ProSubscriptionModal';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

export default function PassportProfilePage() {
  const user = useUserStore((s) => s.user);
  
  const [activeTab, setActiveTab] = useState<'passport' | 'circles' | 'safety'>('passport');
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [liveLocationShared, setLiveLocationShared] = useState(false);

  const passportPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  ];

  const handleShareLiveLocation = () => {
    hapticSuccess();
    setLiveLocationShared(true);
    toast.success('Live GPS coordinates securely shared with your emergency contact!');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#382A21] pb-32 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-[#382A21]">
            Passport & Safety
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Verified Green Score, Badges & Emergency Circles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setIsProModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRO ₹249</span>
          </button>

          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-white border border-stone-200/90 flex items-center justify-center text-stone-700 hover:bg-stone-50 shadow-xs"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-stone-200/70 rounded-full mb-4 border border-stone-200">
        {[
          { id: 'passport', label: 'My Passport (4.8★)' },
          { id: 'circles', label: 'Sparks & Circles' },
          { id: 'safety', label: 'Safety Center (SOS)' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab(t.id as unknown as typeof activeTab);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#1D3B2A] text-white shadow-xs'
                : 'text-stone-600 hover:text-[#382A21]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= SCREEN 4A: PASSPORT & GREEN SCORE ================= */}
      {activeTab === 'passport' && (
        <div className="space-y-4">
          
          {/* Main Passport Card */}
          <div className="p-5 bg-gradient-to-br from-[#1D3B2A] via-[#244633] to-[#1D3B2A] text-white rounded-[32px] shadow-xl border border-white/10 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#79A871]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-[#79A871] shadow-md shrink-0">
                <Image
                  src={passportPhotos[0]}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-lg text-white">
                    {user?.name || 'Verified Traveler'}
                  </h2>
                  <span className="p-1 rounded-full bg-emerald-400 text-[#1D3B2A]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
                <p className="text-xs text-stone-200 font-medium mt-0.5">
                  Bangalore, Karnataka • Joined 2024
                </p>
                
                {/* Digilocker Badges */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 text-white flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Govt ID Verified
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 text-white">
                    Face Matched ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Green Score Ring + Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15 text-center relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-[20px] border border-white/15">
                <div className="font-display font-black text-lg text-[#79A871] flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-[#79A871]" /> 4.8
                </div>
                <div className="text-[10px] font-bold text-stone-300">Green Score</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-[20px] border border-white/15">
                <div className="font-display font-black text-lg text-white">5</div>
                <div className="text-[10px] font-bold text-stone-300">Hosted</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-[20px] border border-white/15">
                <div className="font-display font-black text-lg text-white">12</div>
                <div className="text-[10px] font-bold text-stone-300">Joined</div>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-[#382A21]/70">
              Community Badges & Trust
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-[20px] flex items-center gap-2.5">
                <span className="text-xl">⏱️</span>
                <div>
                  <div className="text-xs font-extrabold text-amber-950">On-Time 10x</div>
                  <div className="text-[10px] text-amber-800">Never delayed a group</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[20px] flex items-center gap-2.5">
                <span className="text-xl">🛡️</span>
                <div>
                  <div className="text-xs font-extrabold text-emerald-950">Safe Companion 15x</div>
                  <div className="text-[10px] text-emerald-800">100% 5★ safety score</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-[20px] flex items-center gap-2.5">
                <span className="text-xl">⛰️</span>
                <div>
                  <div className="text-xs font-extrabold text-blue-950">Trek Leader</div>
                  <div className="text-[10px] text-blue-800">Led 3+ sunrise hikes</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-[20px] flex items-center gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <div className="text-xs font-extrabold text-purple-950">High Energy</div>
                  <div className="text-[10px] text-purple-800">Top voted trip vibe</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Photos Gallery */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#382A21]/70">
                Verified Trip Photos ({passportPhotos.length})
              </h3>
              <button
                type="button"
                onClick={() => toast.success('Upload photo from completed trip')}
                className="text-xs font-bold text-[#1D3B2A] hover:underline"
              >
                + Add Photo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {passportPhotos.map((img, i) => (
                <div key={i} className="relative h-28 rounded-[18px] overflow-hidden border border-stone-200 shadow-xs">
                  <Image src={img} alt="Trip" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= SCREEN 4B: CIRCLES & SPARKS ================= */}
      {activeTab === 'circles' && (
        <div className="space-y-4">
          
          {/* Women-Only Circle Eligibility */}
          <div className="p-5 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/5 border-2 border-purple-400/70 rounded-[28px] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-sm">
                  👩
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-purple-950">
                    Women-Only Travel Circle
                  </h3>
                  <p className="text-[11px] font-semibold text-purple-800">
                    Govt ID Verified Safe Haven
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-purple-200 text-purple-900 rounded-full border border-purple-300">
                Eligible ✓
              </span>
            </div>

            <p className="text-xs text-purple-950/80 font-medium leading-relaxed">
              Access female-only group getaways, private safety chat boards, and verified women hosts across India.
            </p>
          </div>

          {/* My Secret Sparks */}
          <div className="p-4 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#382A21]/70 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-600 fill-pink-600" /> My Sparks (Mutual & Pending)
              </h3>
              <span className="text-[10px] font-extrabold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                2 Sparks
              </span>
            </div>

            {/* Mutual Spark Card */}
            <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-[22px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-pink-500">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Spark"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#382A21] flex items-center gap-1">
                    <span>Ananya Sharma</span>
                    <span className="text-pink-600">💖 Mutual Spark</span>
                  </div>
                  <div className="text-[10px] text-pink-800 font-bold">
                    Level 2 Day Date Unlocked!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Starting Level 2 Day Date plan with Ananya')}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95"
              >
                Plan Day Date
              </button>
            </div>

            {/* Blurred Spark (PRO Tier Upsell) */}
            <div className="p-3.5 bg-stone-100/90 border border-stone-200 rounded-[22px] flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 filter blur-[3px]">
                <div className="w-11 h-11 rounded-full bg-stone-300" />
                <div>
                  <div className="text-xs font-bold text-stone-700">Someone sparked you!</div>
                  <div className="text-[10px] text-stone-500">After Indiranagar Hangout</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setIsProModalOpen(true);
                }}
                className="relative z-10 px-3 py-1.5 bg-[#1D3B2A] text-white rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock with PRO</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ================= SCREEN 4C: SAFETY CENTER & SOS ================= */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          
          {/* Live Location Share to Friend */}
          <div className="p-5 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
                📍
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#382A21]">
                  Live Location Share to Emergency Contact
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Continuous GPS share during active trips
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              Share real-time coordinates, battery level, and host details with your trusted contact before meeting.
            </p>

            <button
              type="button"
              onClick={handleShareLiveLocation}
              disabled={liveLocationShared}
              className={`w-full py-3 rounded-full text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-all ${
                liveLocationShared
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white active:scale-95'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{liveLocationShared ? 'Live Location Active & Shared ✓' : 'Share Live Location (1-Tap)'}</span>
            </button>
          </div>

          {/* Emergency 24/7 Helpline */}
          <div className="p-5 bg-red-50/70 border border-red-200 rounded-[28px] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>National Emergency Services</span>
              </div>
              <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                112 / 1091
              </span>
            </div>
            <p className="text-xs text-red-900/80 font-medium">
              Direct hotline for women&apos;s helpline (1091) and national emergency (112).
            </p>
          </div>

        </div>
      )}

      {/* Pro Modal */}
      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

    </div>
  );
}
