'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  Coffee, 
  Heart, 
  Shield, 
  Check, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';

const ONBOARDING_SLIDES = [
  {
    badge: 'NEW WAY TO MEET',
    title: 'Meet People.\nTravel Together.',
    desc: 'Not another swipe app. Real trips with real people.',
    accent: 'from-emerald-400 to-teal-600',
  },
  {
    badge: 'HOW IT WORKS',
    title: "You don't swipe\npeople, you join\ntheir plans.",
    desc: 'Dating happens on the way, not on the profile.',
    accent: 'from-orange-400 to-rose-500',
  },
  {
    badge: 'SAFE BY DESIGN',
    title: 'Every person\nverified. First\nmeets public.',
    desc: 'No ghosting. No catfishing. Just real humans.',
    accent: 'from-violet-500 to-indigo-600',
  },
  {
    badge: 'TRUST LADDER',
    title: 'Start with coffee,\nearn trust,\nunlock getaways.',
    desc: 'Trust is built in layers. Not blind dates.',
    accent: 'from-amber-400 to-orange-600',
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setGlobalUser = useUserStore((s) => s.setUser);

  const [slide, setSlide] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleFinish = async () => {
    hapticSuccess();
    setCompleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          onboarding_completed: true,
          approval_status: 'approved',
          review_started_at: new Date().toISOString(),
        }).eq('id', user.id);

        const storeUser = useUserStore.getState().user;
        if (storeUser) {
          setGlobalUser({
            ...storeUser,
            onboarding_completed: true,
            approval_status: 'approved',
          });
        }
      }
    } catch (e) {
      console.error('Onboarding complete error:', e);
    }
    router.replace('/trips');
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col justify-between font-[Inter] relative overflow-hidden text-black max-w-md mx-auto">
      {/* Background radial dots and ambient gradients */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Top Segmented Progress Bar */}
      <div className="pt-4 px-6 z-20">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full overflow-hidden bg-black/10">
              <div
                className={`h-full rounded-full transition-all duration-[4000ms] ease-linear ${
                  idx === slide ? 'w-full bg-black' : idx < slide ? 'w-full bg-black/30' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top Visual Area */}
      <div className="relative flex-1 min-h-[320px] max-h-[420px] mx-4 mt-3 rounded-[32px] overflow-hidden border border-black/5 shadow-sm bg-white">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${ONBOARDING_SLIDES[slide].accent} opacity-[0.12]`}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* SLIDE 0: LIVE TRIP MAP */}
        {slide === 0 && (
          <div className="absolute inset-0 p-6 flex items-center justify-center animate-fade-in">
            <div className="relative w-full h-full">
              <div className="absolute inset-2 bg-white rounded-[24px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                <div className="w-full h-full relative bg-[#f8faf8]">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white border-y border-black/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-white border-x border-black/10" />

                  {/* Aarav Pin */}
                  <div className="absolute left-[30%] top-[35%]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg flex items-center justify-center text-white animate-[bounce_2s_infinite]">
                      🧑
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45" />
                  </div>

                  {/* Animated Dash Route */}
                  <svg className="absolute left-[35%] top-[45%] w-[30%] h-[20%] overflow-visible">
                    <path
                      d="M 0 0 Q 30 20 60 10"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  </svg>

                  {/* Meera Pin */}
                  <div className="absolute right-[28%] top-[48%]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg flex items-center justify-center text-white animate-[bounce_2s_0.3s_infinite]">
                      👩
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-medium tracking-wide shadow-md">
                LIVE TRIP
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: 3-STEP TRIP FLOW */}
        {slide === 1 && (
          <div className="absolute inset-0 p-5 flex flex-col justify-center gap-3 animate-fade-in">
            {[
              { icon: <MapPin className="w-5 h-5" />, label: 'Join Trip', color: 'from-amber-400 to-orange-500', step: '1', sub: 'Pick a plan you love' },
              { icon: <Coffee className="w-5 h-5" />, label: 'Meet on Trip', color: 'from-emerald-400 to-teal-500', step: '2', sub: 'Travel together IRL' },
              { icon: <Heart className="w-5 h-5" />, label: 'Spark if vibe matches', color: 'from-rose-400 to-pink-500', step: '3', sub: 'Chemistry over chat' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04]"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md relative shrink-0`}
                >
                  {item.icon}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px]">{item.label}</div>
                  <div className="text-[11px] text-black/50">{item.sub}</div>
                </div>
                {idx < 2 && <ArrowRight className="w-4 h-4 text-black/20 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* SLIDE 2: SAFE BY DESIGN BADGES */}
        {slide === 2 && (
          <div className="absolute inset-0 flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-[260px] bg-white rounded-[28px] p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)] border border-black/5 relative">
              <div className="w-16 h-16 mx-auto rounded-[20px] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_12px_24px_-6px_rgba(16,185,129,0.4)] mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2.5">
                {[
                  'Face Verified',
                  'Govt ID Checked',
                  'Women-Only Circles',
                  'Live Location Share',
                ].map((txt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[12px] font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
              <div className="absolute -top-2.5 -right-2.5 bg-black text-white text-[9px] px-2.5 py-1 rounded-full font-bold shadow">
                SAFE
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: TRUST LADDER TIMELINE */}
        {slide === 3 && (
          <div className="absolute inset-0 p-6 flex items-center animate-fade-in">
            <div className="w-full relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-300 via-orange-400 to-rose-400 rounded-full" />
              {[
                { l: 'Micro Date', d: '60 min coffee', c: 'from-amber-300 to-orange-400', e: 'Public cafe' },
                { l: 'Day Date', d: 'Nandi Hills etc', c: 'from-emerald-400 to-teal-500', e: 'Group of 4' },
                { l: 'Getaway', d: 'Coorg, Chikmagalur', c: 'from-violet-400 to-fuchsia-500', e: 'Unlocked at Lvl 5+' },
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-3 mb-4 last:mb-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.c} shadow-md flex items-center justify-center text-white font-bold text-[11px] z-10 border-[2.5px] border-white shrink-0`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-3 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.1)] border border-black/[0.04]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-[12px]">{item.l}</div>
                        <div className="text-[10px] text-black/50">{item.d}</div>
                      </div>
                      <div className="text-[9px] px-2 py-0.5 rounded-full bg-black/5 font-medium">
                        {item.e}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Text & Actions Area */}
      <div className="bg-white rounded-t-[32px] px-6 pt-6 pb-8 flex flex-col shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.08)] border-t border-black/5 z-20">
        <div className="inline-flex self-start px-3 py-1 rounded-full bg-black/[0.06] text-[10px] font-bold tracking-widest mb-3">
          {ONBOARDING_SLIDES[slide].badge}
        </div>
        <h1 className="text-[26px] font-[800] leading-[1.05] tracking-tight whitespace-pre-line">
          {ONBOARDING_SLIDES[slide].title}
        </h1>
        <p className="text-[14px] leading-[1.4] text-black/60 mt-2 font-[450]">
          {ONBOARDING_SLIDES[slide].desc}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setSlide((s) => (s > 0 ? s - 1 : 3));
            }}
            className="h-[50px] px-5 rounded-full border border-black/10 font-semibold text-[14px] active:scale-[0.96] transition cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            disabled={completing}
            onClick={() => {
              if (slide === 3) {
                handleFinish();
              } else {
                hapticTap();
                setSlide((s) => s + 1);
              }
            }}
            className="flex-1 h-[50px] rounded-full bg-black text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] active:scale-[0.98] transition cursor-pointer"
          >
            {completing
              ? 'Loading...'
              : slide === 3
              ? 'Start Exploring Bangalore'
              : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === slide ? 'w-7 bg-black' : 'w-1.5 bg-black/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
