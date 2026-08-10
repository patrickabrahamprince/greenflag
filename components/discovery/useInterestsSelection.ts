'use client';

import { useState } from 'react';

// Uncapped -- interests used to hard-lock at exactly 5 per list (a
// tap past the 5th silently did nothing) and continuing required
// exactly 5, with no way to skip. Both requirements are gone: pick as
// many or as few as you want in each list, and the whole step is
// skippable via the page's own Skip button.
export function useInterestsSelection() {
  const [interestsHave, setInterestsHave] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const toggle = (list: 'have' | 'looking', item: string) => {
    const set = list === 'have' ? setInterestsHave : setLookingFor;
    set((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  return { interestsHave, lookingFor, toggle };
}
