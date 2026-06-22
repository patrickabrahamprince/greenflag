import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore, useCoinStore, useConnectionStore } from '@/lib/store';

describe('Zustand stores', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
    useCoinStore.setState({ balance: 0 });
    useConnectionStore.setState({ connections: [] });
  });

  describe('User store', () => {
    it('should start with null user', () => {
      expect(useUserStore.getState().user).toBeNull();
    });

    it('should set user', () => {
      const mockUser = {
        id: 'test-id',
        name: 'Test User',
        age: 25,
        city: 'Mumbai',
        bio: 'Hello',
        photos: [],
        persona: 'man' as const,
        created_at: new Date().toISOString(),
      };
      useUserStore.getState().setUser(mockUser);
      expect(useUserStore.getState().user?.name).toBe('Test User');
    });

    it('should clear user', () => {
      const mockUser = {
        id: 'test-id',
        name: 'Test User',
        age: 25,
        city: 'Mumbai',
        bio: 'Hello',
        photos: [],
        persona: 'man' as const,
        created_at: new Date().toISOString(),
      };
      useUserStore.getState().setUser(mockUser);
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('Coin store', () => {
    it('should start with 0 balance', () => {
      expect(useCoinStore.getState().balance).toBe(0);
    });

    it('should set balance', () => {
      useCoinStore.getState().setBalance(100);
      expect(useCoinStore.getState().balance).toBe(100);
    });

    it('should deduct coins', () => {
      useCoinStore.getState().setBalance(10);
      useCoinStore.getState().deduct(5);
      expect(useCoinStore.getState().balance).toBe(5);
    });

    it('should not go below 0', () => {
      useCoinStore.getState().setBalance(3);
      useCoinStore.getState().deduct(5);
      expect(useCoinStore.getState().balance).toBe(0);
    });

    it('should add coins', () => {
      useCoinStore.getState().setBalance(5);
      useCoinStore.getState().add(10);
      expect(useCoinStore.getState().balance).toBe(15);
    });
  });

  describe('Connection store', () => {
    it('should start with empty connections', () => {
      expect(useConnectionStore.getState().connections).toEqual([]);
    });

    it('should set connections', () => {
      const mockConnections = [
        {
          id: 'conn-1',
          test_id: 'test-1',
          guest_id: 'guest-1',
          host_id: 'host-1',
          status: 'pending' as const,
          tasks_completed: 0,
          expires_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ];
      useConnectionStore.getState().setConnections(mockConnections);
      expect(useConnectionStore.getState().connections).toHaveLength(1);
    });

    it('should add a connection', () => {
      const mockConnection = {
        id: 'conn-1',
        test_id: 'test-1',
        guest_id: 'guest-1',
        host_id: 'host-1',
        status: 'pending' as const,
        tasks_completed: 0,
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      useConnectionStore.getState().addConnection(mockConnection);
      expect(useConnectionStore.getState().connections).toHaveLength(1);
    });

    it('should update a connection', () => {
      const mockConnection = {
        id: 'conn-1',
        test_id: 'test-1',
        guest_id: 'guest-1',
        host_id: 'host-1',
        status: 'pending' as const,
        tasks_completed: 0,
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      useConnectionStore.getState().addConnection(mockConnection);
      useConnectionStore.getState().updateConnection('conn-1', { status: 'chat_unlocked' });
      expect(useConnectionStore.getState().connections[0].status).toBe('chat_unlocked');
    });
  });
});
