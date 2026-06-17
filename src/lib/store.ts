"use client";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile, Test, Connection } from "@/lib/types";

interface AppState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ user: null, loading: false });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    set({ user: data || null, loading: false });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

interface TestState {
  tests: Test[];
  setTests: (tests: Test[]) => void;
  fetchActive: () => Promise<void>;
}

export const useTestStore = create<TestState>((set) => ({
  tests: [],
  setTests: (tests) => set({ tests }),
  fetchActive: async () => {
    const { data } = await supabase
      .from("tests")
      .select("*, host:host_id(*)")
      .eq("is_active", true);
    set({ tests: data || [] });
  },
}));

interface ConnectionState {
  connections: Connection[];
  setConnections: (connections: Connection[]) => void;
  fetchMine: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: [],
  setConnections: (connections) => set({ connections }),
  fetchMine: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("connections")
      .select("*, guest:guest_id(*), host:host_id(*), test:test_id(*)")
      .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    set({ connections: data || [] });
  },
}));
