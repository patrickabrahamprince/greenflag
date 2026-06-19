'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { INTERESTS_MASTER } from '@/lib/constants/interests';

const PERSONA_OPTIONS = [
  'Art Galleries', 'Wine Tasting', 'Classical Music', 'Ballet',
  'Poetry', 'Architecture', 'Vintage Fashion', 'Philosophy',
  'Fine Dining', 'Theatre', 'Jazz', 'Sailing', 'Equestrian',
  'Opera', 'Interior Design', 'Rare Books', 'Scotch Tasting',
  'Polo', 'Mindfulness', 'Yacht Week', 'Formula 1',
  'Culinary Arts', 'Contemporary Art', 'Travel Design',
];

const STANDARD_OPTIONS = [
  'Ambition', 'Emotional Depth', 'Discretion', 'Intellectual Curiosity',
  'Dry Wit', 'Old-School Manners', 'Consistency', 'Financial Literacy',
  'Self-Mastery', 'Stoicism', 'Leadership', 'Loyalty', 'Taste',
  'Groundedness', 'Patience', 'Worldliness', 'Integrity', 'Presence',
  'Generosity', 'Composure', 'Drive', 'Discernment', 'Authenticity',
  'Vision',
];

export default function OnboardInterestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const [role, setRole] = useState<'host' | 'guest' | null>(null);
  const [persona, setPersona] = useState<string[]>([]);
  const [standard, setStandard] = useState<string[]>([]);
  const [genericInterests, setGenericInterests] = useState<string[]>([]);
  const [genericLookingFor, setGenericLookingFor] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const p = data as { role: string } | null;
          if (!p) {
            router.replace('/onboard');
            return;
          }
          setRole(p.role as 'host' | 'guest');
          setAuthChecked(true);
        });
    });
  }, []);

  const isHost = role === 'host';

  const togglePersona = (item: string) => {
    setPersona((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  };

  const toggleStandard = (item: string) => {
    setStandard((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  };

  const toggleGenericInterest = (item: string) => {
    setGenericInterests((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  };

  const toggleGenericLookingFor = (item: string) => {
    setGenericLookingFor((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  };

  const handleComplete = async () => {
    if (isHost) {
      if (persona.length !== 5) { toast.error('Choose exactly 5 persona tags'); return; }
      if (standard.length !== 5) { toast.error('Choose exactly 5 standard traits'); return; }
    } else {
      if (genericInterests.length < 3) { toast.error('Choose at least 3 interests'); return; }
      if (genericLookingFor.length < 3) { toast.error('Choose at least 3 looking for'); return; }
    }
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Session expired');
      router.replace('/login');
      return;
    }

    const payload: Record<string, unknown> = { id: authUser.id, onboarding_completed: true };
    if (isHost) {
      payload.about_me_tags = persona;
      payload.looking_for_tags = standard;
      payload.looking_for_interests = standard;
      payload.gender = 'host';
    } else {
      payload.about_me_tags = genericInterests;
      payload.looking_for_tags = genericLookingFor;
      payload.interests = genericInterests;
      payload.looking_for_interests = genericLookingFor;
      payload.gender = 'guest';
    }

    const { error } = await supabase.from('profiles').upsert(payload as any);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setUser({
      id: authUser.id,
      name: '',
      age: 25,
      city: '',
      bio: '',
      photos: [],
      role: role || 'guest',
      created_at: new Date().toISOString(),
    } as any);

    toast.success('Profile created!');
    router.replace(isHost ? '/discover-men' : '/discover');
  };

  if (!authChecked) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.replace(`/onboard/profile?role=${role}`)}
          className="text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">
            {isHost ? 'Define Your Standard' : 'Your Interests'}
          </p>
        </div>
        <div className="w-6" />
      </div>

      <div className="space-y-8">
        {isHost ? (
          <>
            <div>
              <h2 className="text-xl font-display text-white mb-1">Your Persona</h2>
              <p className="text-sm text-muted mb-4">What defines you? Choose 5.</p>
              <div className="flex flex-wrap gap-2">
                {PERSONA_OPTIONS.map((item) => {
                  const selected = persona.includes(item);
                  const locked = persona.length >= 5 && !selected;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => !locked && togglePersona(item)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                        selected
                          ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                          : locked
                          ? 'border border-white/5 bg-transparent text-muted/30 cursor-not-allowed'
                          : 'border border-white/10 bg-transparent text-muted hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-2">{persona.length}/5 selected</p>
            </div>

            <div>
              <h2 className="text-xl font-display text-white mb-1">Your Standard</h2>
              <p className="text-sm text-muted mb-4">You admire a man who values&hellip; Choose 5.</p>
              <div className="flex flex-wrap gap-2">
                {STANDARD_OPTIONS.map((item) => {
                  const selected = standard.includes(item);
                  const locked = standard.length >= 5 && !selected;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => !locked && toggleStandard(item)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                        selected
                          ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                          : locked
                          ? 'border border-white/5 bg-transparent text-muted/30 cursor-not-allowed'
                          : 'border border-white/10 bg-transparent text-muted hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-2">{standard.length}/5 selected</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-display text-white mb-1">Your Interests</h2>
              <p className="text-sm text-muted mb-4">Pick what you love. Min 3, Max 5.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_MASTER.map((item) => {
                  const selected = genericInterests.includes(item);
                  const locked = genericInterests.length >= 5 && !selected;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => !locked && toggleGenericInterest(item)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                        selected
                          ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                          : locked
                          ? 'border border-white/5 bg-transparent text-muted/30 cursor-not-allowed'
                          : 'border border-white/10 bg-transparent text-muted hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-2">{genericInterests.length}/5 selected</p>
            </div>

            <div>
              <h2 className="text-xl font-display text-white mb-1">You&rsquo;re Interested In</h2>
              <p className="text-sm text-muted mb-4">You&rsquo;re looking for women who like&hellip; Min 3, Max 5.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_MASTER.map((item) => {
                  const selected = genericLookingFor.includes(item);
                  const locked = genericLookingFor.length >= 5 && !selected;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => !locked && toggleGenericLookingFor(item)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                        selected
                          ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                          : locked
                          ? 'border border-white/5 bg-transparent text-muted/30 cursor-not-allowed'
                          : 'border border-white/10 bg-transparent text-muted hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-2">{genericLookingFor.length}/5 selected</p>
            </div>
          </>
        )}

        <button
          onClick={handleComplete}
          disabled={loading}
          className="btn-primary w-full mt-2 active:scale-95"
        >
          {loading ? 'Creating profile...' : 'Complete'}
        </button>
      </div>
    </div>
  );
}
