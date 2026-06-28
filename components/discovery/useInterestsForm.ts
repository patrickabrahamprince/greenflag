import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';

function useTagSelection(max = 5) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (item: string) => {
    setSelected((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= max) return prev;
      return [...prev, item];
    });
  };

  return { selected, toggle };
}

export function useInterestsForm(persona: 'woman' | 'man' | null) {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const personaTags = useTagSelection();
  const standard = useTagSelection();
  const genericInterests = useTagSelection();
  const genericLookingFor = useTagSelection();

  const [loading, setLoading] = useState(false);

  const isWoman = persona === 'woman';

  const validate = (): boolean => {
    if (isWoman) {
      if (personaTags.selected.length !== 5) { toast.error('Choose exactly 5 persona tags'); return false; }
      if (standard.selected.length !== 5) { toast.error('Choose exactly 5 standard traits'); return false; }
    } else {
      if (genericInterests.selected.length < 3) { toast.error('Choose at least 3 interests'); return false; }
      if (genericLookingFor.selected.length < 3) { toast.error('Choose at least 3 looking for'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Session expired');
      router.replace('/login');
      return;
    }

    const payload = {
      id: authUser.id,
      onboarding_completed: true,
      interests: isWoman ? undefined : genericInterests.selected,
      looking_for_interests: isWoman ? standard.selected : genericLookingFor.selected,
      persona: isWoman ? 'woman' : 'man',
    };

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
      persona: persona || 'man',
      created_at: new Date().toISOString(),
    });

    toast.success('Profile created!');
    router.replace('/discover');
  };

  return {
    persona: personaTags,
    standard,
    genericInterests,
    genericLookingFor,
    loading,
    handleSubmit,
  };
}
