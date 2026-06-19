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
