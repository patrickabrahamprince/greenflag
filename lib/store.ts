'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile, Connection } from '@/types';

interface UserState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  clearUser: () => void;
}

interface CoinState {
  balance: number;
  setBalance: (balance: number) => void;
  deduct: (amount: number) => void;
  add: (amount: number) => void;
}

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: (by?: number) => void;
}

interface ConnectionState {
  connections: Connection[];
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
}

interface OnboardingState {
  persona: 'woman' | 'man' | null;
  name: string;
  age: number | null;
  city: string;
  lat: number | null;
  lng: number | null;
  instagramHandle: string;
  instagramVerified: boolean;
  bio: string;
  teaserPrompt: string;
  teaserAnswer: string;
  interestsHave: string[];
  interestsLookingFor: string[];
  setPersona: (p: 'woman' | 'man') => void;
  setName: (name: string) => void;
  setAge: (age: number) => void;
  setLocation: (city: string, lat: number | null, lng: number | null) => void;
  setInstagram: (handle: string, verified: boolean) => void;
  setBio: (bio: string) => void;
  setTeaser: (prompt: string, answer: string) => void;
  toggleInterest: (list: 'have' | 'looking', item: string) => void;
  clearOnboarding: () => void;
}

// Which screen is currently showing whose content, for the single
// app-wide screenshot listener (see components/providers.tsx +
// lib/hooks/useScreenshotGuard.ts) to read at the moment a screenshot
// fires -- avoids mounting a separate native listener per page.
interface ScreenshotContextState {
  notifyUserId: string | null;
  context: 'task' | 'messages' | 'profile' | null;
  setScreenshotContext: (notifyUserId: string, context: 'task' | 'messages' | 'profile') => void;
  clearScreenshotContext: () => void;
}

export const useScreenshotContextStore = create<ScreenshotContextState>((set) => ({
  notifyUserId: null,
  context: null,
  setScreenshotContext: (notifyUserId, context) => set({ notifyUserId, context }),
  clearScreenshotContext: () => set({ notifyUserId: null, context: null }),
}));

// Persisted to localStorage: this store is the only place profile-wizard
// answers (name, age, city, instagram, bio, teaser) live until the very
// last screen of onboarding actually writes a profiles row -- six-plus
// screens in, someone can be carrying real answers here with nothing
// saved server-side yet. Without persistence, any mid-flow reload (the
// web Google OAuth redirect through /auth/callback, or the WKWebView
// reloading under memory pressure) silently wiped everything and
// middleware.ts bounced them back to persona-select to start over.
// clearOnboarding() removes the persisted copy too (via `state: null`),
// so a completed signup doesn't leave stale answers sitting in
// localStorage for a hypothetical future onboarding pass.
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      persona: null,
      name: '',
      age: null,
      city: '',
      lat: null,
      lng: null,
      instagramHandle: '',
      instagramVerified: false,
      bio: '',
      teaserPrompt: '',
      teaserAnswer: '',
      interestsHave: [],
      interestsLookingFor: [],
      setPersona: (persona) => set({ persona }),
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setLocation: (city, lat, lng) => set({ city, lat, lng }),
      setInstagram: (instagramHandle, instagramVerified) => set({ instagramHandle, instagramVerified }),
      setBio: (bio) => set({ bio }),
      setTeaser: (teaserPrompt, teaserAnswer) => set({ teaserPrompt, teaserAnswer }),
      toggleInterest: (list, item) =>
        set((state) => {
          const key = list === 'have' ? 'interestsHave' : 'interestsLookingFor';
          const current = state[key];
          return {
            [key]: current.includes(item) ? current.filter((i) => i !== item) : [...current, item],
          };
        }),
      clearOnboarding: () =>
        set({
          persona: null,
          name: '',
          age: null,
          city: '',
          lat: null,
          lng: null,
          instagramHandle: '',
          instagramVerified: false,
          bio: '',
          teaserPrompt: '',
          teaserAnswer: '',
          interestsHave: [],
          interestsLookingFor: [],
        }),
    }),
    {
      name: 'gf-onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { setPersona, setName, setAge, setLocation, setInstagram, setBio, setTeaser, toggleInterest, clearOnboarding, ...data } = state;
        return data;
      },
    }
  )
);

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_E2E_TESTING === 'true') {
  (window as any).__e2e = { onboardingStore: useOnboardingStore };
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export const useCoinStore = create<CoinState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  deduct: (amount) =>
    set((state) => ({ balance: Math.max(0, state.balance - amount) })),
  add: (amount) => set((state) => ({ balance: state.balance + amount })),
}));

// Bottom-nav's badge and the Alerts list both need the unread count, but
// they mount/unmount independently as the user navigates tabs -- a shared
// store instead of two separate local useState calls is what lets marking
// something read on the Alerts page actually move the badge instead of
// the two silently drifting out of sync until the badge's own next full
// refetch.
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrement: (by = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
}));

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: [],
  setConnections: (connections) => set({ connections }),
  addConnection: (connection) =>
    set((state) => ({ connections: [...state.connections, connection] })),
  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
