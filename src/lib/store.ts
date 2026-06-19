// @ts-nocheck
import { create } from 'zustand';

export interface UserState {
  id: string;
  phone: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  persona: 'man' | 'woman' | 'standard' | 'rise' | null;
  photos: string[];
  interests: string[];
  lookingFor: string[];
  coins?: number;
}

interface AppStore {
  user: UserState | null;
  inviteCode: string | null;
  coins: number;
  connections: any[];
  chatLocks: Record<string, number>; // connectionId -> day milestone unlocked
  setInviteCode: (code: string) => void;
  setUser: (user: Partial<UserState> | null) => void;
  setPersona: (persona: 'man' | 'woman' | 'standard' | 'rise') => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  setConnections: (connections: any[]) => void;
  unlockChatDay: (connectionId: string, day: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: {
    id: 'user_123',
    phone: '+919999999999',
    name: 'Kabir',
    age: 26,
    city: 'Mumbai',
    bio: 'Product Designer & Coffee enthusiast. Seeking standard intentions.',
    persona: 'man', // Default to 'man' post-onboarding for testing
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    ],
    interests: ['Coffee', 'Design', 'Music', 'Running', 'Tech'],
    lookingFor: ['Long term', 'Shared values'],
  },
  inviteCode: null,
  coins: 150, // Default to 150 coins to support checkins
  connections: [
    {
      id: 'conn_1',
      partner: {
        id: 'partner_1',
        name: 'Aanya',
        age: 24,
        city: 'Mumbai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        persona: 'woman',
        bio: 'Artsy and values honesty.',
      },
      currentDay: 3,
      approved_count: 2, // 2 out of 8 days approved
      currentSubmission: 'I made sure to text updates during my commute as requested!', // man's submission
      streakActive: true,
      progress: 25.0, // 2/8 days approved
      expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hrs left
      intentionsLocked: true,
    },
    {
      id: 'conn_2',
      partner: {
        id: 'partner_2',
        name: 'Riya',
        age: 25,
        city: 'Mumbai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        persona: 'woman',
        bio: 'Writer, dreamer, tea drinker.',
      },
      currentDay: 5,
      approved_count: 4,
      currentSubmission: 'Planned our Friday coffee meeting at Blue Tokai!',
      streakActive: true,
      progress: 50.0, // 4/8 days
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hrs left
      intentionsLocked: true,
    }
  ],
  chatLocks: {
    'conn_1': 3,
    'conn_2': 5,
  },
  setInviteCode: (code) => set({ inviteCode: code }),
  setUser: (updatedUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : (updatedUser as UserState),
    })),
  setPersona: (persona) =>
    set((state) => ({
      user: state.user ? { ...state.user, persona } : null,
    })),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  deductCoins: (amount) => {
    const currentCoins = get().coins;
    if (currentCoins >= amount) {
      set({ coins: currentCoins - amount });
      return true;
    }
    return false;
  },
  setConnections: (connections) => set({ connections }),
  unlockChatDay: (connectionId, day) =>
    set((state) => ({
      chatLocks: { ...state.chatLocks, [connectionId]: day },
    })),
  logout: () => set({ user: null, inviteCode: null, coins: 0, connections: [] }),
}));

export const useStore = useAppStore;

