'use client';

import { create } from 'zustand';
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

interface ConnectionState {
  connections: Connection[];
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
}

interface OnboardingState {
  persona: 'woman' | 'man' | null;
  name: string;
  setPersona: (p: 'woman' | 'man') => void;
  setName: (name: string) => void;
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

export const useOnboardingStore = create<OnboardingState>((set) => ({
  persona: null,
  name: '',
  setPersona: (persona) => set({ persona }),
  setName: (name) => set({ name }),
  clearOnboarding: () => set({ persona: null, name: '' }),
}));

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
