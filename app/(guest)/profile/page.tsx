'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, LogOut, Edit3, Coins } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    setBalance(0);
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display flex-1">Profile</h1>
        <button onClick={() => router.push('/settings')} className="btn-ghost p-2">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold mb-4">
          {user.photos?.[0] ? (
            <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center text-2xl font-display text-gold">
              {user.name?.[0]}
            </div>
          )}
        </div>
        <h2 className="text-2xl font-display text-white">{user.name}</h2>
        <p className="text-muted text-sm mt-1">{user.age} &middot; {user.city}</p>
        {user.bio && <p className="text-muted text-sm mt-3 text-center max-w-xs">{user.bio}</p>}
      </div>

      <div className="space-y-3 px-4">
        <button onClick={() => router.push('/profile/edit')} className="btn-primary w-full flex items-center justify-center gap-2">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>

        <button onClick={() => router.push('/settings')} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      <div className="px-4 mt-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-gold" />
              <div>
                <p className="text-white font-medium">Coins: {balance}</p>
                <p className="text-xs text-muted mt-0.5">Purchase coins to connect</p>
              </div>
            </div>
            <button onClick={() => router.push('/coins')} className="btn-primary text-sm py-2 px-4">
              Buy Coins
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-8">
        <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
