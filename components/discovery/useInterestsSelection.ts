'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function useInterestsSelection() {
  const [interestsHave, setInterestsHave] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const toggle = (list: 'have' | 'looking', item: string) => {
    const set = list === 'have' ? setInterestsHave : setLookingFor;
    set((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= 5) return prev;
      return [...prev, item];
    });
  };

  const validate = (isWoman: boolean): boolean => {
    if (interestsHave.length !== 5) {
      toast.error('Pick exactly 5 things about you');
      return false;
    }
    if (lookingFor.length !== 5) {
      toast.error("Pick exactly 5 things you're looking for");
      return false;
    }
    return true;
  };

  return { interestsHave, lookingFor, toggle, validate };
}
