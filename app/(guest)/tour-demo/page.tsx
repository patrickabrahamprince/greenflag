'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameTheoryPhoneOnboarding } from '@/components/onboarding/GameTheoryPhoneOnboarding';
import HomeHubPage from '@/app/(guest)/home-hub/page';
import { AppFeatureTour } from '@/components/tour/AppFeatureTour';
import { Sparkles, ArrowRight, Compass, Calendar, Trophy, Phone } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

export default function TourDemoPage() {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<'welcome' | 'hub' | 'schedule' | 'membership'>('hub');
  const [showTour, setShowTour] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white max-w-md mx-auto relative flex flex-col font-sans">
      
      {/* Top Demo Switcher Pill */}
      <div className="fixed top-2 inset-x-4 z-50 flex items-center justify-between bg-[#1E2124]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-2xl">
        <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => setCurrentMode('welcome')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              currentMode === 'welcome' ? 'bg-[#E2F84F] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Phone className="w-3 h-3" />
            <span>1. Welcome</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentMode('hub')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              currentMode === 'hub' ? 'bg-[#E2F84F] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>2. Home & Tour</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/schedule')}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/60 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" />
            <span>3. Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/membership')}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/60 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            <span>4. Pass</span>
          </button>
        </div>
      </div>

      {/* Screen Render */}
      <div className="pt-10 flex-1 flex flex-col">
        {currentMode === 'welcome' && (
          <GameTheoryPhoneOnboarding onSuccess={() => setCurrentMode('hub')} />
        )}

        {currentMode === 'hub' && (
          <HomeHubPage />
        )}
      </div>
    </div>
  );
}
